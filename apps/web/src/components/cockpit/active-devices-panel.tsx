import React from 'react';
import { Badge, Link, EmptyState } from '@/components/ui';
import { ConsolePanel } from './console-panel';
import type { ActiveDeviceRow } from '@/lib/cockpit/overview-aggregate';
import { formatRelativeTime } from '@/lib/cockpit/format';

interface ActiveDevicesPanelProps {
  rows: ActiveDeviceRow[];
  totalDevices: number;
  hrefBase?: string;
}

/**
 * Active devices currently reporting work, grouped by project.
 *
 * Reads `state.activeFleet` (per Task 008 projection rework) and renders a
 * dense terminal-table view. Devices with `activeTaskCount === 0` are not
 * shown — the fleet panel is only for devices that *are* doing something.
 */
export const ActiveDevicesPanel: React.FC<ActiveDevicesPanelProps> = ({
  rows,
  totalDevices,
  hrefBase = '/cockpit',
}) => {
  return (
    <ConsolePanel
      title="Active devices"
      command="cockpit fleet ls --active"
      meta={
        rows.length > 0 ? (
          <Badge variant="info">
            {rows.length} live · {totalDevices} known
          </Badge>
        ) : (
          <Badge variant="muted">{totalDevices} known</Badge>
        )
      }
      flush
    >
      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="No devices are reporting work"
            description="Pair a daemon device or run cockpit-daemon on a workstation to start receiving heartbeats."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 text-left">Device</th>
                <th scope="col" className="px-4 py-2 text-left">Project</th>
                <th scope="col" className="px-4 py-2 text-left">Active plan</th>
                <th scope="col" className="px-4 py-2 text-right">Tasks</th>
                <th scope="col" className="px-4 py-2 text-right">Last beat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.map((row) => (
                <tr
                  key={`${row.projectId}:${row.deviceId}`}
                  className="transition-colors hover:bg-accent/5"
                >
                  <td className="px-4 py-2 align-top">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full bg-success shadow-[0_0_0_3px_hsl(var(--success)/0.18)]"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-sm text-foreground">
                        {row.deviceName ?? row.deviceId}
                      </span>
                    </div>
                    {row.instanceName && (
                      <div className="ml-4 mt-0.5 font-mono text-xs text-muted-foreground">
                        {row.instanceName}
                      </div>
                    )}
                    {!row.deviceName && (
                      <div className="ml-4 mt-0.5 font-mono text-xs text-muted-foreground/70">
                        {row.deviceId}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <Link
                      href={`${hrefBase}/${row.projectId}`}
                      variant="muted"
                      className="font-mono text-sm"
                    >
                      {row.projectName}
                    </Link>
                  </td>
                  <td className="px-4 py-2 align-top">
                    {row.activePlanId ? (
                      <span className="font-mono text-xs text-foreground/85">
                        {row.activePlanId}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right align-top tabular-nums">
                    <Badge
                      variant={row.activeTaskCount > 0 ? 'info' : 'muted'}
                    >
                      {row.activeTaskCount}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right align-top font-mono text-xs text-muted-foreground tabular-nums">
                    {formatRelativeTime(row.lastHeartbeatAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ConsolePanel>
  );
};
