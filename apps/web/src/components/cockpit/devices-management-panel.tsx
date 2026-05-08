import React from 'react';
import { Badge, EmptyState, Link } from '@/components/ui';
import { ConsolePanel } from './console-panel';
import { formatRelativeTime } from '@/lib/cockpit/format';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DeviceRow {
  deviceId: string;
  deviceName: string;
  instanceName: string | null;
  pairedAt: Date | string;
  lastSeenAt: Date | string | null;
  revokedAt: Date | string | null;
  revokedReason: string | null;
  activeSessionCount: number;
  maxEventSequence: number | null;
  latestToken: {
    tokenId: string;
    tokenLabel: string | null;
    issuedAt: Date | string;
    expiresAt: Date | string | null;
    lastUsedAt: Date | string | null;
    revokedAt: Date | string | null;
  } | null;
  observedProjectCount: number;
  lastHeartbeatAt: string | null;
}

interface DevicesManagementPanelProps {
  devices: DeviceRow[];
  /** Base href for the cockpit (defaults to /cockpit). */
  hrefBase?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function isExpired(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return false;
  const exp = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return exp.getTime() < Date.now();
}

function deviceStatusVariant(device: DeviceRow): 'muted' | 'success' | 'warning' | 'destructive' {
  if (device.revokedAt) return 'destructive';
  if (device.latestToken?.revokedAt) return 'destructive';
  if (device.latestToken?.expiresAt && isExpired(device.latestToken.expiresAt)) return 'warning';
  if (device.activeSessionCount > 0) return 'success';
  return 'muted';
}

function deviceStatusLabel(device: DeviceRow): string {
  if (device.revokedAt) return 'Revoked';
  if (device.latestToken?.revokedAt) return 'Token revoked';
  if (device.latestToken?.expiresAt && isExpired(device.latestToken.expiresAt)) return 'Token expired';
  if (device.activeSessionCount > 0) return `${device.activeSessionCount} session${device.activeSessionCount !== 1 ? 's' : ''}`;
  return 'No session';
}

function formatDateShort(value: Date | string | null): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * Terminal-style table of all paired devices.
 *
 * Displays device identity, pairing date, token metadata (label + age — never
 * the raw token value), active session count, last heartbeat, last event
 * sequence, and observed project count.
 *
 * Revoked and token-expired devices are shown with a destructive/warning badge
 * so operators can distinguish them from healthy devices.
 */
export const DevicesManagementPanel: React.FC<DevicesManagementPanelProps> = ({
  devices,
  hrefBase = '/cockpit',
}) => {
  const activeCount = devices.filter((d) => !d.revokedAt).length;

  return (
    <ConsolePanel
      title="Paired devices"
      command="cockpit devices ls"
      meta={
        devices.length > 0 ? (
          <Badge variant={activeCount > 0 ? 'info' : 'muted'}>
            {activeCount} active · {devices.length} total
          </Badge>
        ) : (
          <Badge variant="muted">0 devices</Badge>
        )
      }
      flush
    >
      {devices.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="No paired devices"
            description="Pair a cockpit-daemon by running cockpit-daemon login on your workstation."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 text-left">Device</th>
                <th scope="col" className="px-4 py-2 text-left">Token</th>
                <th scope="col" className="px-4 py-2 text-right">Projects</th>
                <th scope="col" className="px-4 py-2 text-right">Last seq</th>
                <th scope="col" className="px-4 py-2 text-right">Last beat</th>
                <th scope="col" className="px-4 py-2 text-left">Status</th>
                <th scope="col" className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {devices.map((device) => {
                const statusVariant = deviceStatusVariant(device);
                const statusLabel = deviceStatusLabel(device);
                const isRevoked = !!device.revokedAt;

                return (
                  <tr
                    key={device.deviceId}
                    className={`transition-colors hover:bg-accent/5 ${isRevoked ? 'opacity-60' : ''}`}
                  >
                    {/* Device identity */}
                    <td className="px-4 py-2 align-top">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            isRevoked
                              ? 'bg-destructive/50'
                              : device.activeSessionCount > 0
                                ? 'bg-success shadow-[0_0_0_3px_hsl(var(--success)/0.18)]'
                                : 'bg-muted-foreground/40'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-sm font-medium text-foreground">
                          {device.deviceName}
                        </span>
                      </div>
                      {device.instanceName && (
                        <div className="ml-4 mt-0.5 font-mono text-xs text-muted-foreground">
                          {device.instanceName}
                        </div>
                      )}
                      <div className="ml-4 mt-0.5 font-mono text-xs text-muted-foreground/50 tabular-nums">
                        {device.deviceId}
                      </div>
                      <div className="ml-4 mt-0.5 font-mono text-xs text-muted-foreground/50">
                        Paired {formatDateShort(device.pairedAt)}
                      </div>
                    </td>

                    {/* Token info — label and age only, never the hash */}
                    <td className="px-4 py-2 align-top">
                      {device.latestToken ? (
                        <div className="space-y-0.5">
                          <div className="font-mono text-xs text-foreground/85">
                            {device.latestToken.tokenLabel ?? '(no label)'}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground">
                            Issued {formatRelativeTime(
                              device.latestToken.issuedAt instanceof Date
                                ? device.latestToken.issuedAt.toISOString()
                                : device.latestToken.issuedAt as string,
                            )}
                          </div>
                          {device.latestToken.expiresAt && (
                            <div
                              className={`font-mono text-xs ${
                                isExpired(device.latestToken.expiresAt)
                                  ? 'text-warning'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {isExpired(device.latestToken.expiresAt) ? 'Expired' : 'Expires'}{' '}
                              {formatDateShort(device.latestToken.expiresAt)}
                            </div>
                          )}
                          {device.latestToken.lastUsedAt && (
                            <div className="font-mono text-xs text-muted-foreground">
                              Last used {formatRelativeTime(
                                device.latestToken.lastUsedAt instanceof Date
                                  ? device.latestToken.lastUsedAt.toISOString()
                                  : device.latestToken.lastUsedAt as string,
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Observed project count */}
                    <td className="px-4 py-2 text-right align-top tabular-nums">
                      {device.observedProjectCount > 0 ? (
                        <Badge variant="muted">{device.observedProjectCount}</Badge>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Last event sequence */}
                    <td className="px-4 py-2 text-right align-top font-mono text-xs text-muted-foreground tabular-nums">
                      {device.maxEventSequence !== null ? device.maxEventSequence.toLocaleString() : '—'}
                    </td>

                    {/* Last heartbeat */}
                    <td className="px-4 py-2 text-right align-top font-mono text-xs text-muted-foreground tabular-nums">
                      {device.lastHeartbeatAt
                        ? formatRelativeTime(device.lastHeartbeatAt)
                        : '—'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2 align-top">
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                      {isRevoked && device.revokedReason && (
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {device.revokedReason}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2 text-right align-top">
                      {!isRevoked ? (
                        <Link
                          href={`${hrefBase}/devices/${device.deviceId}/revoke`}
                          variant="nav"
                          className="font-mono text-xs text-destructive hover:text-destructive/80"
                        >
                          Revoke
                        </Link>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground/50">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ConsolePanel>
  );
};
