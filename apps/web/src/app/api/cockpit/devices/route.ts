/**
 * GET /api/cockpit/devices – list all paired devices (active + optionally revoked),
 * enriched with active-session counts, token metadata (no hash), and per-device
 * project-observation stats derived from the projected state.
 *
 * Query params:
 *   includeRevoked=true  – also return revoked devices (admin only, auditing)
 *
 * Requires an active admin session.
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

// ── Per-device observation stats (from projected project states) ───────────────

interface DeviceObservationStats {
  observedProjectCount: number;
  lastHeartbeatAt: string | null;
}

async function buildDeviceObservationStats(
  deviceIds: string[],
): Promise<Map<string, DeviceObservationStats>> {
  if (deviceIds.length === 0) return new Map();

  const repo = getCockpitRepository();

  // Load all project records to get the list of project IDs
  const projects = await repo.listProjects();

  const stats = new Map<string, DeviceObservationStats>(
    deviceIds.map((id) => [id, { observedProjectCount: 0, lastHeartbeatAt: null }]),
  );

  // For each project, load the projected state and extract per-device info
  const statePromises = projects.map((p) => repo.getProjectedProjectState(p.projectId));
  const states = await Promise.all(statePromises);

  for (const state of states) {
    if (!state) continue;

    for (const deviceId of deviceIds) {
      const deviceObs = state.devices?.[deviceId];
      if (!deviceObs) continue;

      const current = stats.get(deviceId)!;
      current.observedProjectCount += 1;

      const heartbeatAt = deviceObs.lastHeartbeat?.occurredAt ?? null;
      if (
        heartbeatAt &&
        (!current.lastHeartbeatAt || heartbeatAt > current.lastHeartbeatAt)
      ) {
        current.lastHeartbeatAt = heartbeatAt;
      }
    }
  }

  return stats;
}

// ── GET /api/cockpit/devices ──────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const includeRevoked = request.nextUrl.searchParams.get('includeRevoked') === 'true';

  try {
    const repo = getCockpitRepository();

    const [devicesWithDetails, pendingPairings] = await Promise.all([
      repo.listDevicesWithDetails({ includeRevoked }),
      repo.listPendingDevicePairings(),
    ]);

    const deviceIds = devicesWithDetails.map((d) => d.deviceId);
    const observationStats = await buildDeviceObservationStats(deviceIds);

    const devices = devicesWithDetails.map((device) => {
      const obs = observationStats.get(device.deviceId);
      return {
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
              // tokenHash is intentionally omitted
            }
          : null,
        observedProjectCount: obs?.observedProjectCount ?? 0,
        lastHeartbeatAt: obs?.lastHeartbeatAt ?? null,
      };
    });

    return NextResponse.json({ devices, pendingPairings });
  } catch (err) {
    console.error('[cockpit/devices] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
