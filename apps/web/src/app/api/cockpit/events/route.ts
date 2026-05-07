/**
 * POST /api/cockpit/events
 *
 * Event ingestion endpoint for paired cockpit daemons.
 *
 * Authentication is via a daemon-specific bearer token (NOT a browser session).
 * The token was issued during the device pairing flow and stored as a hash in
 * `cockpit_device_tokens`.  Anonymous requests and browser sessions are rejected.
 *
 * Request headers:
 *   Authorization: Bearer <rawToken>
 *
 * Request body (EventBatch from @cleandev/cockpit-protocol):
 *   {
 *     batchId:  string
 *     sentAt:   string (ISO 8601)
 *     events:   CockpitEvent[]
 *   }
 *
 * Response 200 (EventBatchAck):
 *   {
 *     batchId:              string
 *     ackedThroughSequence: number
 *     acceptedCount:        number
 *     duplicateCount:       number
 *     rejected:             RejectedEvent[]
 *     serverTime:           string
 *   }
 */

import { type NextRequest, NextResponse } from 'next/server';
import { eventBatchSchema } from '@cleandev/cockpit-protocol';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import {
  authenticateCockpitDaemon,
  readLimitedJson,
  validateBatchDeviceIdentity,
} from '@/lib/cockpit-security';

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Step 1: Authenticate the daemon via bearer token ──────────────────────
  const repo = getCockpitRepository();
  const daemon = await authenticateCockpitDaemon(request, repo);
  if (!daemon) {
    return NextResponse.json(
      { error: 'Unauthorized – valid daemon bearer token required' },
      { status: 401 },
    );
  }

  // ── Step 2: Parse the request body ────────────────────────────────────────
  const parsed = await readLimitedJson(request);
  if ('response' in parsed) return parsed.response;

  const rawBody = parsed.data;

  // ── Step 3: Validate the event batch schema ────────────────────────────────
  const parseResult = eventBatchSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid event batch',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const batch = parseResult.data;
  const denied = validateBatchDeviceIdentity(batch, daemon.deviceId);
  if (denied) return denied;

  // ── Step 4: Persist events ─────────────────────────────────────────────────
  try {
    const ack = await repo.insertEventBatch(batch);
    return NextResponse.json(ack);
  } catch (err) {
    console.error('[cockpit/events] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
