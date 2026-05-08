import React from 'react';
import { Badge, EmptyState, Link } from '@/components/ui';
import { ConsolePanel } from '../console-panel';
import { TaskStatusBadge } from '../task-status-badge';
import type { CockpitProjectedTaskState } from '@cleandev/cockpit-store';
import {
  formatDuration,
  formatRelativeTime,
  formatCostUsd,
  formatNumber,
} from '@/lib/cockpit/format';

interface ProjectTasksPanelProps {
  title: string;
  command: string;
  tasks: CockpitProjectedTaskState[];
  projectId: string;
  variant?: 'running' | 'failed' | 'completed' | 'archived' | 'pending';
  emptyTitle?: string;
  emptyDescription?: string;
  /** Hide the "View" link if no drilldown is meaningful (e.g. unimplemented). */
  hrefBase?: string;
}

const VARIANT_BADGE: Record<
  NonNullable<ProjectTasksPanelProps['variant']>,
  React.ComponentProps<typeof Badge>['variant']
> = {
  running: 'info',
  failed: 'destructive',
  completed: 'success',
  archived: 'muted',
  pending: 'muted',
};

/**
 * Reusable task table for the project drilldown screens. The same component
 * is used to render running, failed, completed and archived tasks — only the
 * title, command annotation, badge variant, and ordering differ. Each row
 * links to a per-task drilldown so an operator can read the exact task
 * markdown, latest progress, handoff/output and runtime.
 */
export const ProjectTasksPanel: React.FC<ProjectTasksPanelProps> = ({
  title,
  command,
  tasks,
  projectId,
  variant = 'running',
  emptyTitle,
  emptyDescription,
  hrefBase = '/cockpit',
}) => {
  return (
    <ConsolePanel
      title={title}
      command={command}
      meta={
        tasks.length > 0 ? (
          <Badge variant={VARIANT_BADGE[variant]}>
            {tasks.length} {variant}
          </Badge>
        ) : null
      }
      flush
    >
      {tasks.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title={emptyTitle ?? `No ${variant} tasks`}
            description={
              emptyDescription ??
              'Once the daemon reports tasks for this project they will appear here.'
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 text-left">
                  Task
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Status
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Agent / model
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  Tokens
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  Cost
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  Runtime
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  When
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {tasks.map((task) => {
                const exec = task.execution ?? {};
                const tokens =
                  (task.usage?.inputTokens ?? 0) +
                  (task.usage?.outputTokens ?? 0);
                const cost = Number(task.costEstimate?.totalCost ?? 0);
                const taskHref = `${hrefBase}/${projectId}/tasks/${encodeURIComponent(task.taskId)}`;
                const when =
                  task.status === 'running'
                    ? task.startedAt
                    : task.completedAt ?? task.archive?.archivedAt;
                return (
                  <tr
                    key={task.taskId}
                    className="transition-colors hover:bg-accent/5"
                  >
                    <td className="px-4 py-2 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={taskHref}
                          variant="muted"
                          className="text-sm font-medium text-foreground hover:text-accent"
                        >
                          {task.taskName}
                        </Link>
                        {task.slug && (
                          <span className="font-mono text-xs text-muted-foreground">
                            {task.slug}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 font-mono text-xs text-muted-foreground/80">
                        plan: {task.planId}
                      </div>
                      {task.latestProgress?.step && (
                        <div className="mt-0.5 line-clamp-1 font-mono text-xs text-foreground/80">
                          <span className="text-accent">↳</span>{' '}
                          {task.latestProgress.step}
                        </div>
                      )}
                      {task.error && variant === 'failed' && (
                        <div className="mt-1 line-clamp-2 rounded-sm border border-destructive/30 bg-destructive/5 px-2 py-1 font-mono text-xs text-destructive">
                          {task.error}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <TaskStatusBadge status={task.status ?? 'pending'} />
                      {task.archive?.reviewStatus && (
                        <div className="mt-1">
                          <Badge variant="outline">
                            review: {task.archive.reviewStatus}
                          </Badge>
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
                        {exec.profile && (
                          <span className="rounded-sm border border-border/60 bg-muted/30 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                            {exec.profile}
                          </span>
                        )}
                        {!exec.agentRole &&
                          !exec.model &&
                          !exec.engine &&
                          !exec.profile && (
                            <span className="font-mono text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                      {tokens > 0 ? formatNumber(tokens) : '—'}
                    </td>
                    <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground/85">
                      {cost > 0 ? formatCostUsd(cost) : '—'}
                    </td>
                    <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums">
                      {task.durationMs != null ? (
                        <span className="text-foreground">
                          {formatDuration(task.durationMs)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                      {formatRelativeTime(when)}
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
