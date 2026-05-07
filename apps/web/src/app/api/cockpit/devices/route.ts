/**
 * GET /api/cockpit/devices – list all paired (active) devices and pending pairings
 *
 * Requires an active admin session.
 */

import { NextResponse } from 'next/server';
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

// ── GET /api/cockpit/devices ──────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const repo = getCockpitRepository();
    const [devices, pendingPairings] = await Promise.all([
      repo.listDevices({ includeRevoked: false }),
      repo.listPendingDevicePairings(),
    ]);

    return NextResponse.json({ devices, pendingPairings });
  } catch (err) {
    console.error('[cockpit/devices] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
