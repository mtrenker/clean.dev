/**
 * POST /api/cockpit/devices/approve
 *
 * Browser-session step 2 of the device-code pairing flow.
 *
 * An authenticated admin user calls this endpoint (from the cockpit UI) to
 * approve a pending device pairing request identified by its userCode.
 *
 * Requires an active admin session (GitHub OAuth, role = "admin").
 *
 * Request body:
 *   {
 *     userCode:    string  // human-readable code displayed on the daemon's terminal
 *     tokenLabel?: string  // optional label for this credential
 *   }
 *
 * Response 200:
 *   {
 *     approved: true
 *     device:   { deviceId, deviceName, instanceName, pairedAt, ... }
 *   }
 *
 * The bearer token itself is NOT returned here — the daemon must exchange the
 * deviceCode via POST /api/cockpit/devices/exchange to receive it.  This
 * separation ensures the browser session never holds or sees the daemon token.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { isAdminSession } from '@/lib/authz';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { readLimitedJson } from '@/lib/cockpit-security';

// ── Auth helper ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  if (!session) {
    return { denied: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null };
  }
  if (!isAdminSession(session)) {
    return { denied: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), session: null };
  }
  return { denied: null, session };
}

// ── Validation ─────────────────────────────────────────────────────────────────

interface ApproveBody {
  userCode: string;
  tokenLabel?: string | null;
}

function validateApproveBody(body: unknown): { data: ApproveBody } | { error: string } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.userCode !== 'string' || !raw.userCode.trim() || raw.userCode.length > 32) {
    return { error: 'userCode is required and must be a non-empty string up to 32 characters' };
  }

  if (typeof raw.tokenLabel === 'string' && raw.tokenLabel.length > 512) {
    return { error: 'tokenLabel must be 512 characters or fewer' };
  }

  return {
    data: {
      userCode: raw.userCode.trim().toUpperCase(),
      tokenLabel:
        typeof raw.tokenLabel === 'string' ? raw.tokenLabel.trim() || null : null,
    },
  };
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { denied, session } = await requireAdmin();
  if (denied) return denied;

  const parsed = await readLimitedJson(request);
  if ('response' in parsed) return parsed.response;

  const result = validateApproveBody(parsed.data);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const { userCode, tokenLabel } = result.data;

  try {
    const repo = getCockpitRepository();
    const pairing = await repo.approveDevicePairing({
      userCode,
      tokenLabel: tokenLabel ?? `token-${new Date().toISOString().slice(0, 10)}`,
      approvedBy: session?.user?.email ?? null,
    });

    return NextResponse.json({ approved: true, pairing });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message.includes('not found or expired')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes('Cannot approve')) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    console.error('[cockpit/devices/approve] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
