/**
 * POST /api/cockpit/devices/pair
 *
 * Daemon-initiated step 1 of the device-code pairing flow.
 *
 * The daemon (running without a user session) calls this endpoint to register
 * its intent to pair.  No authentication is required here — the security comes
 * from the browser-session approval step that follows.
 *
 * Request body:
 *   {
 *     deviceId:    string  // stable unique id chosen by the daemon
 *     deviceName:  string  // human-readable label (e.g. "Martin's MacBook Pro")
 *     instanceName?: string
 *   }
 *
 * Response 200:
 *   {
 *     deviceCode:      string  // secret polling code (64 hex chars)
 *     userCode:        string  // short code for the user to enter in the UI
 *     verificationUri: string  // URL where the user approves the pairing
 *     expiresIn:       number  // seconds until the codes expire
 *   }
 */

import { randomBytes } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import {
  COCKPIT_PAIR_POLICY,
  enforceRateLimit,
  hashCockpitSecret,
  readLimitedJson,
} from '@/lib/cockpit-security';

const PAIRING_TTL_MS = 5 * 60 * 1000;

function generateDeviceCode(): string {
  return randomBytes(32).toString('hex');
}

function generateUserCode(): string {
  const charset = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const part = (n: number) =>
    Array.from({ length: n }, () => charset[randomBytes(1)[0] % charset.length]).join('');
  return `${part(5)}-${part(5)}`;
}

// ── Validation ─────────────────────────────────────────────────────────────────

interface PairBody {
  deviceId: string;
  deviceName: string;
  instanceName?: string | null;
}

function validatePairBody(body: unknown): { data: PairBody } | { error: string } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.deviceId !== 'string' || !raw.deviceId.trim() || raw.deviceId.length > 160) {
    return { error: 'deviceId is required and must be a non-empty string up to 160 characters' };
  }

  if (typeof raw.deviceName !== 'string' || !raw.deviceName.trim() || raw.deviceName.length > 512) {
    return { error: 'deviceName is required and must be a non-empty string up to 512 characters' };
  }

  if (typeof raw.instanceName === 'string' && raw.instanceName.length > 512) {
    return { error: 'instanceName must be 512 characters or fewer' };
  }

  return {
    data: {
      deviceId: raw.deviceId.trim(),
      deviceName: raw.deviceName.trim(),
      instanceName:
        typeof raw.instanceName === 'string' ? raw.instanceName.trim() || null : null,
    },
  };
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const limited = enforceRateLimit(request, 'pair', COCKPIT_PAIR_POLICY);
  if (limited) return limited;

  const parsed = await readLimitedJson(request);
  if ('response' in parsed) return parsed.response;

  const result = validatePairBody(parsed.data);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  const { deviceId, deviceName, instanceName } = result.data;
  const deviceCode = generateDeviceCode();
  const userCode = generateUserCode();
  const expiresAt = new Date(Date.now() + PAIRING_TTL_MS);

  const repo = getCockpitRepository();
  const pairing = await repo.createDevicePairing({
    deviceCodeHash: hashCockpitSecret(deviceCode),
    userCode,
    deviceId,
    deviceName,
    instanceName,
    expiresAt,
  });

  // Build the verification URI relative to the current host.
  // In production NEXTAUTH_URL should be set; fall back gracefully.
  const baseUrl =
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000';

  const verificationUri = `${baseUrl.replace(/\/$/, '')}/cockpit/devices/approve?userCode=${pairing.userCode}`;

  return NextResponse.json({
    deviceCode,
    userCode: pairing.userCode,
    verificationUri,
    expiresIn: Math.max(0, Math.floor((pairing.expiresAt.getTime() - Date.now()) / 1000)),
  });
}
