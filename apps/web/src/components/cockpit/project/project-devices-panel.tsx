import React from 'react';
import { Badge, EmptyState } from '@/components/ui';
import { ConsolePanel } from '../console-panel';
import type { ProjectDeviceRow } from '@/lib/cockpit/project-detail';
import { formatRelativeTime } from '@/lib/cockpit/format';

interface ProjectDevicesPanelProps {
  rows: ProjectDeviceRow[];
}

/**
 * Devices observing this project. Shows every device that has emitted at
 * least one event for this project, with active-fleet status, current
 * heartbeat, observation labels and host metadata. Active devices float to
 * the top so an operator can see who is actually doing work right now.
 */
export const ProjectDevicesPanel: React.FC<ProjectDevicesPanelProps> = ({
  rows,
}) => {
  return (
    <ConsolePanel
      title="Devices observing this project"
      command="cockpit fleet ls --project"
      meta={
        rows.length > 0 ? (
          <Badge variant="muted">
            {rows.filter((r) => r.isActive).length} active · {rows.length} known
          </Badge>
        ) : null
      }
      flush
    >
      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="No devices have observed this project"
            description="Map this project on a paired daemon device to start receiving events."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 text-left">
                  Device
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Host / platform
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Last event
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  Tasks
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  Last beat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.map(({ device, isActive, activeTaskCount, activePlanId }) => (
                <tr
                  key={device.deviceId}
                  className="transition-colors hover:bg-accent/5"
                >
                  <td className="px-4 py-2 align-top">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          isActive
                            ? 'inline-block h-2 w-2 rounded-full bg-success shadow-[0_0_0_3px_hsl(var(--success)/0.18)]'
                            : 'inline-block h-2 w-2 rounded-full bg-muted-foreground/40'
                        }
                        aria-hidden="true"
                      />
                      <span className="font-mono text-sm text-foreground">
                        {device.deviceName ?? device.deviceId}
                      </span>
                      {device.instanceName && (
                        <span className="font-mono text-xs text-muted-foreground">
                          · {device.instanceName}
                        </span>
                      )}
                    </div>
                    {device.deviceName && (
                      <div className="ml-4 mt-0.5 font-mono text-xs text-muted-foreground/70">
                        {device.deviceId}
                      </div>
                    )}
                    {device.labels && device.labels.length > 0 && (
                      <div className="ml-4 mt-1 flex flex-wrap gap-1">
                        {device.labels.map((label) => (
                          <Badge key={label} variant="outline">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top font-mono text-xs text-muted-foreground">
                    <div>{device.hostname ?? '—'}</div>
                    <div>
                      {device.platform ?? '—'}
                      {device.appVersion && (
                        <span> · v{device.appVersion}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="font-mono text-xs text-foreground/85">
                      {device.lastEventType}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {formatRelativeTime(device.lastEventAt)}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right align-top tabular-nums">
                    <Badge variant={isActive ? 'info' : 'muted'}>
                      {activeTaskCount}
                    </Badge>
                    {activePlanId && (
                      <div className="mt-1 font-mono text-xs text-muted-foreground">
                        {activePlanId}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right align-top font-mono text-xs text-muted-foreground tabular-nums">
                    {device.lastHeartbeat
                      ? formatRelativeTime(device.lastHeartbeat.occurredAt)
                      : '—'}
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
