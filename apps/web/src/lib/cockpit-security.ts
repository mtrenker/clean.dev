import { createHash } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import type { EventBatch } from '@cleandev/cockpit-protocol';
import type { ICockpitRepository } from '@cleandev/cockpit-store';
import { checkRateLimit, type RateLimitPolicy } from './rate-limit';

export const COCKPIT_PAIR_POLICY: RateLimitPolicy = {
  limit: 20,
  windowMs: 15 * 60 * 1_000,
};

export const COCKPIT_EXCHANGE_POLICY: RateLimitPolicy = {
  limit: 120,
  windowMs: 15 * 60 * 1_000,
};

export const MAX_COCKPIT_JSON_BYTES = 256 * 1024;

export function hashCockpitSecret(rawValue: string): string {
  return createHash('sha256').update(rawValue).digest('hex');
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || request.headers.get('x-real-ip') || 'unknown';
}

export function enforceRateLimit(
  request: NextRequest,
  scope: string,
  policy: RateLimitPolicy,
): NextResponse | null {
  const key = `cockpit:${scope}:ip:${getClientIp(request)}`;
  const result = checkRateLimit(key, policy);

  if (result.allowed) {
    return null;
  }

  return NextResponse.json(
    { error: 'Too many requests' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))),
      },
    },
  );
}

export async function readLimitedJson(request: NextRequest): Promise<{ data: unknown } | { response: NextResponse }> {
  const raw = await request.text();

  if (Buffer.byteLength(raw, 'utf8') > MAX_COCKPIT_JSON_BYTES) {
    return {
      response: NextResponse.json({ error: 'Request body too large' }, { status: 413 }),
    };
  }

  try {
    return { data: JSON.parse(raw) as unknown };
  } catch {
    return {
      response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
    };
  }
}

export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

export async function authenticateCockpitDaemon(
  request: NextRequest,
  repo: ICockpitRepository,
): Promise<{ deviceId: string; tokenId: string } | null> {
  const rawToken = extractBearerToken(request);
  if (!rawToken) return null;

  const tokenRecord = await repo.findActiveTokenByHash(hashCockpitSecret(rawToken));
  if (!tokenRecord) return null;

  return { deviceId: tokenRecord.deviceId, tokenId: tokenRecord.tokenId };
}

export function validateBatchDeviceIdentity(
  batch: EventBatch,
  authenticatedDeviceId: string,
): NextResponse | null {
  const hasForeignDeviceEvent = batch.events.some((event) => event.deviceId !== authenticatedDeviceId);

  if (!hasForeignDeviceEvent) {
    return null;
  }

  return NextResponse.json(
    { error: 'Event deviceId does not match authenticated daemon' },
    { status: 403 },
  );
}
