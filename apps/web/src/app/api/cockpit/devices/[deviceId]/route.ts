/**
 * GET  /api/cockpit/devices/[deviceId]  – single device with full detail
 * DELETE /api/cockpit/devices/[deviceId] – revoke a device
 *
 * Both operations require an active admin session.
 *
 * GET response shape:
 *   { device: EnrichedDevice, pendingPairings: [...] }
 *
 * DELETE request body (optional):
 *   { reason?: string }
 *
 * DELETE response 200:
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

// ── GET /api/cockpit/devices/[deviceId] ───────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> },
): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { deviceId } = await params;

  if (!deviceId?.trim()) {
    return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
  }

  try {
    const repo = getCockpitRepository();

    // Use listDevicesWithDetails scoped to all devices and pick the right one.
    // This is slightly over-fetching but keeps the join logic in one place.
    const allDevices = await repo.listDevicesWithDetails({ includeRevoked: true });
    const device = allDevices.find((d) => d.deviceId === deviceId);

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Collect per-device project observations from projected state
    const projects = await repo.listProjects();
    let observedProjectCount = 0;
    let lastHeartbeatAt: string | null = null;

    const stateResults = await Promise.all(
      projects.map((p) => repo.getProjectedProjectState(p.projectId)),
    );

    for (const state of stateResults) {
      if (!state) continue;
      const deviceObs = state.devices?.[deviceId];
      if (!deviceObs) continue;

      observedProjectCount += 1;
      const hb = deviceObs.lastHeartbeat?.occurredAt ?? null;
      if (hb && (!lastHeartbeatAt || hb > lastHeartbeatAt)) {
        lastHeartbeatAt = hb;
      }
    }

    const enriched = {
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      instanceName: device.instanceName,
      metadata: device.metadata,
      pairedAt: device.pairedAt,
      lastSeenAt: device.lastSeenAt,
      revokedAt: device.revokedAt,
      revokedReason: device.revokedReason,
      activeSessionCount: device.activeSessionCount,
      maxEventSequence: device.maxEventSequence,
      latestToken: device.latestToken
        ? {
            tokenId: device.latestToken.tokenId,
            tokenLabel: device.latestToken.tokenLabel,
            issuedAt: device.latestToken.issuedAt,
            expiresAt: device.latestToken.expiresAt,
            lastUsedAt: device.latestToken.lastUsedAt,
            revokedAt: device.latestToken.revokedAt,
            revokedReason: device.latestToken.revokedReason,
            // tokenHash intentionally omitted
          }
        : null,
      observedProjectCount,
      lastHeartbeatAt,
    };

    return NextResponse.json({ device: enriched });
  } catch (err) {
    console.error(`[cockpit/devices/${deviceId}] GET error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE /api/cockpit/devices/[deviceId] ────────────────────────────────────

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
