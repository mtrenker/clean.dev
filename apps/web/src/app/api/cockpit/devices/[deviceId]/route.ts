/**
 * DELETE /api/cockpit/devices/[deviceId]
 *
 * Revokes a paired device and all its associated tokens and sessions.
 * Requires an active admin session.
 *
 * Optional request body:
 *   { reason?: string }
 *
 * Response 200:
 *   { device: { deviceId, deviceName, revokedAt, ... } }
 */

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from 'auth';
import { isAdminSession } from '@/lib/authz';
import { getCockpitRepository } from '@/lib/cockpit-repo';

// ── Auth helper ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> },
): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { deviceId } = await params;

  if (!deviceId?.trim()) {
    return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
  }

  let reason: string | null = null;
  try {
    const body = await request.json().catch(() => null);
    if (body && typeof body === 'object' && typeof (body as Record<string, unknown>).reason === 'string') {
      reason = ((body as Record<string, unknown>).reason as string).trim() || null;
    }
  } catch {
    // reason is optional; ignore parse errors
  }

  try {
    const repo = getCockpitRepository();
    const device = await repo.revokeDevice({ deviceId, reason });
    return NextResponse.json({ device });
  } catch (err) {
    if (err instanceof Error && err.message.includes('no device found')) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    console.error(`[cockpit/devices/${deviceId}] DELETE error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
