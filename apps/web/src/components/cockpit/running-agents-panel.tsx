import React from 'react';
import { Badge, EmptyState, Link } from '@/components/ui';
import { ConsolePanel } from './console-panel';
import type { RunningAgentRow } from '@/lib/cockpit/overview-aggregate';
import { formatDuration, formatRelativeTime } from '@/lib/cockpit/format';

interface RunningAgentsPanelProps {
  rows: RunningAgentRow[];
  hrefBase?: string;
}

const NBSP = ' ';

/**
 * Live view of every task whose status is `running`, with the agent role,
 * model, latest progress step, and rolling duration.
 *
 * The table is the operational answer to "what is the cockpit doing right
 * now?" — sorted longest-running first so a stuck agent surfaces.
 */
export const RunningAgentsPanel: React.FC<RunningAgentsPanelProps> = ({
  rows,
  hrefBase = '/cockpit',
}) => {
  return (
    <ConsolePanel
      title="Running agents"
      command="cockpit agents ls --status running"
      meta={
        rows.length > 0 ? (
          <Badge variant="info">{rows.length} live</Badge>
        ) : (
          <Badge variant="muted">idle</Badge>
        )
      }
      flush
    >
      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="No agents are running"
            description="The cockpit will surface running tasks here as soon as a paired device starts an agent."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 text-left">Task</th>
                <th scope="col" className="px-4 py-2 text-left">Project</th>
                <th scope="col" className="px-4 py-2 text-left">Agent / model</th>
                <th scope="col" className="px-4 py-2 text-left">Latest step</th>
                <th scope="col" className="px-4 py-2 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.map((row) => {
                const exec = row.task.execution ?? {};
                return (
                  <tr
                    key={`${row.projectId}:${row.task.taskId}`}
                    className="transition-colors hover:bg-accent/5"
                  >
                    <td className="px-4 py-2 align-top">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 animate-pulse rounded-full bg-info shadow-[0_0_0_3px_hsl(var(--info)/0.2)]"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-foreground">
                          {row.task.taskName}
                        </span>
                      </div>
                      {row.task.slug && (
                        <div className="ml-4 mt-0.5 font-mono text-xs text-muted-foreground">
                          {row.task.slug}
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
                      {row.task.planId && (
                        <div className="font-mono text-xs text-muted-foreground/70">
                          plan: {row.task.planId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <div className="flex flex-wrap gap-1">
                        {exec.agentRole && (
                          <span className="rounded-sm border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-xs text-accent">
                            {exec.agentRole}
                          </span>
                        )}
                        {exec.model && (
                          <span className="rounded-sm border border-border/60 bg-muted/30 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                            {exec.model}
                          </span>
                        )}
                        {exec.engine && (
                          <span className="rounded-sm border border-border/60 bg-muted/30 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                            {exec.engine}
                          </span>
                        )}
                        {!exec.agentRole && !exec.model && !exec.engine && (
                          <span className="font-mono text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-top font-mono text-xs text-foreground/85">
                      {row.latestStep ? (
                        <span className="line-clamp-2">
                          <span className="text-accent">↳</span> {row.latestStep}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">awaiting…</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums">
                      <div className="text-foreground">
                        {row.durationMs != null
                          ? formatDuration(row.durationMs)
                          : NBSP}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(row.startedAt)}
                      </div>
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
