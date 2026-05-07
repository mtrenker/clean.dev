/**
 * POST /api/cockpit/devices/exchange
 *
 * Daemon step 3 of the device-code pairing flow.
 *
 * The daemon polls this endpoint after calling /pair.  Once the user has
 * approved the pairing in the browser, this endpoint returns the bearer token
 * the daemon will use for all subsequent API calls.
 *
 * No browser session is required or used — the daemon authenticates with the
 * deviceCode it received from /pair.
 *
 * Request body:
 *   {
 *     deviceCode: string  // secret code returned by /pair
 *     deviceId:   string  // must match the deviceId used in /pair
 *   }
 *
 * Response 200 (approved):
 *   { status: "approved", token: string, deviceId: string }
 *
 * Response 202 (still pending):
 *   { status: "pending" }
 *
 * Response 410 (expired or not found):
 *   { status: "expired" }
 */

import { randomBytes } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import {
  COCKPIT_EXCHANGE_POLICY,
  enforceRateLimit,
  hashCockpitSecret,
  readLimitedJson,
} from '@/lib/cockpit-security';

function generateRawToken(): string {
  return randomBytes(32).toString('hex');
}

// ── Validation ─────────────────────────────────────────────────────────────────

interface ExchangeBody {
  deviceCode: string;
  deviceId: string;
}

function validateExchangeBody(body: unknown): { data: ExchangeBody } | { error: string } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.deviceCode !== 'string' || !raw.deviceCode.trim() || raw.deviceCode.length > 512) {
    return { error: 'deviceCode is required and must be a non-empty string up to 512 characters' };
  }

  if (typeof raw.deviceId !== 'string' || !raw.deviceId.trim() || raw.deviceId.length > 160) {
    return { error: 'deviceId is required and must be a non-empty string up to 160 characters' };
  }

  return {
    data: {
      deviceCode: raw.deviceCode.trim(),
      deviceId: raw.deviceId.trim(),
    },
  };
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const limited = enforceRateLimit(request, 'exchange', COCKPIT_EXCHANGE_POLICY);
  if (limited) return limited;

  const parsed = await readLimitedJson(request);
  if ('response' in parsed) return parsed.response;

  const result = validateExchangeBody(parsed.data);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const { deviceCode, deviceId } = result.data;
  const rawToken = generateRawToken();

  try {
    const repo = getCockpitRepository();
    const exchange = await repo.exchangeDevicePairing({
      deviceCodeHash: hashCockpitSecret(deviceCode),
      deviceId,
      tokenHash: hashCockpitSecret(rawToken),
    });

    if (exchange.status === 'expired') {
      return NextResponse.json({ status: 'expired' }, { status: 410 });
    }

    if (exchange.status === 'pending') {
      return NextResponse.json({ status: 'pending' }, { status: 202 });
    }

    if (exchange.status === 'device_mismatch') {
      return NextResponse.json(
        { error: 'deviceId does not match the pairing request' },
        { status: 403 },
      );
    }

    if (!exchange.pairing) {
      return NextResponse.json({ status: 'expired' }, { status: 410 });
    }

    return NextResponse.json({
      status: 'approved',
      token: rawToken,
      deviceId: exchange.pairing.deviceId,
    });
  } catch (err) {
    console.error('[cockpit/devices/exchange] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
