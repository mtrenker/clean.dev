import type { Metadata } from 'next';
import { getCockpitRepository } from '@/lib/cockpit-repo';
import { Badge, Button, Card, Heading, Link } from '@/components/ui';
import { DevicesManagementPanel } from '@/components/cockpit/devices-management-panel';
import type { DeviceRow } from '@/components/cockpit/devices-management-panel';

export const metadata: Metadata = {
  title: 'Cockpit — Devices',
};

export const dynamic = 'force-dynamic';

// ── Per-device project observation stats ──────────────────────────────────────

async function buildObservationStats(
  deviceIds: string[],
  repo: Awaited<ReturnType<typeof getCockpitRepository>>,
): Promise<Map<string, { observedProjectCount: number; lastHeartbeatAt: string | null }>> {
  const stats = new Map(
    deviceIds.map((id) => [id, { observedProjectCount: 0, lastHeartbeatAt: null as string | null }]),
  );

  if (deviceIds.length === 0) return stats;

  const projects = await repo.listProjects();
  const states = await Promise.all(projects.map((p) => repo.getProjectedProjectState(p.projectId)));

  for (const state of states) {
    if (!state) continue;
    for (const deviceId of deviceIds) {
      const obs = state.devices?.[deviceId];
      if (!obs) continue;
      const current = stats.get(deviceId)!;
      current.observedProjectCount += 1;
      const hb = obs.lastHeartbeat?.occurredAt ?? null;
      if (hb && (!current.lastHeartbeatAt || hb > current.lastHeartbeatAt)) {
        current.lastHeartbeatAt = hb;
      }
    }
  }

  return stats;
}

// ── Page ──────────────────────────────────────────────────────────────────────

const DevicesPage = async () => {
  const repo = getCockpitRepository();

  const [devicesWithDetails, pendingPairings] = await Promise.all([
    repo.listDevicesWithDetails({ includeRevoked: true }),
    repo.listPendingDevicePairings(),
  ]);

  const deviceIds = devicesWithDetails.map((d) => d.deviceId);
  const obsStats = await buildObservationStats(deviceIds, repo);

  const deviceRows: DeviceRow[] = devicesWithDetails.map((device) => {
    const obs = obsStats.get(device.deviceId);
    return {
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      instanceName: device.instanceName,
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
          }
        : null,
      observedProjectCount: obs?.observedProjectCount ?? 0,
      lastHeartbeatAt: obs?.lastHeartbeatAt ?? null,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Heading as="h1" variant="section" className="text-2xl sm:text-3xl">
            Devices
          </Heading>
          <p className="text-sm text-muted-foreground">
            Cockpit daemon devices paired to this workspace. Each device communicates via a scoped
            bearer token issued during the pairing flow.
          </p>
        </div>
        <Link href="/cockpit/devices/approve">
          <Button variant="secondary" size="sm">
            Pair device
          </Button>
        </Link>
      </div>

      {/* Pending pairings banner */}
      {pendingPairings.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-warning-foreground">
                Pending pairing requests
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {pendingPairings.length} device{pendingPairings.length !== 1 ? 's are' : ' is'}{' '}
                waiting for approval.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="warning">{pendingPairings.length} pending</Badge>
              <Link href="/cockpit/devices/approve">
                <Button size="sm">Approve</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Devices table */}
      <DevicesManagementPanel devices={deviceRows} />

      {/* Back navigation */}
      <div>
        <Link href="/cockpit" variant="nav" className="text-sm">
          ← Back to cockpit overview
        </Link>
      </div>
    </div>
  );
};

export default DevicesPage;
