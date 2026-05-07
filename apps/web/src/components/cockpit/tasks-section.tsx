import React from 'react';
import type { CockpitProjectedTaskState } from '@cleandev/cockpit-store';
import { EmptyState } from '@/components/ui';
import { TaskStatusBadge } from './task-status-badge';

interface TasksSectionProps {
  tasks: CockpitProjectedTaskState[];
  /** If provided, only show tasks matching this status filter */
  filterStatus?: CockpitProjectedTaskState['status'];
  /** If true, show failed tasks first, then running, then others */
  prioritiseFailed?: boolean;
}

function formatDuration(ms: number | null | undefined): string {
  if (!ms) return '';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return `${minutes}m${seconds}s`;
}

function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return '';
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
  } catch {
    return '';
  }
}

export const TasksSection: React.FC<TasksSectionProps> = ({
  tasks,
  filterStatus,
  prioritiseFailed = false,
}) => {
  let filtered = filterStatus
    ? tasks.filter((t) => t.status === filterStatus)
    : [...tasks];

  if (prioritiseFailed) {
    filtered.sort((a, b) => {
      const order = { failed: 0, running: 1, retrying: 2, pending: 3, done: 4 };
      return (order[a.status ?? 'pending'] ?? 3) - (order[b.status ?? 'pending'] ?? 3);
    });
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        title={filterStatus ? `No ${filterStatus} tasks` : 'No tasks'}
        description={filterStatus
          ? `No tasks with status "${filterStatus}" found.`
          : 'No task data has been received yet.'}
      />
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map((task) => (
        <div
          key={task.taskId}
          className="rounded-sm border border-border bg-background p-3"
        >
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {task.taskName}
                </span>
                {task.slug && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {task.slug}
                  </span>
                )}
              </div>
              {task.description && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
              {task.error && (
                <p className="mt-1 rounded-sm bg-destructive/10 px-2 py-1 font-mono text-xs text-destructive">
                  {task.error}
                </p>
              )}
              {task.latestProgress?.step && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  ↳ {task.latestProgress.step}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <TaskStatusBadge status={task.status ?? 'pending'} />
              {task.durationMs != null && (
                <span className="text-xs text-muted-foreground">
                  {formatDuration(task.durationMs)}
                </span>
              )}
              {task.completedAt && (
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(task.completedAt)}
                </span>
              )}
            </div>
          </div>
          {task.execution && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {task.execution.model && (
                <span className="rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  {task.execution.model}
                </span>
              )}
              {task.execution.engine && (
                <span className="rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  {task.execution.engine}
                </span>
              )}
              {task.execution.agentRole && (
                <span className="rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  {task.execution.agentRole}
                </span>
              )}
            </div>
          )}
          {task.usage && (
            <div className="mt-1.5 text-xs text-muted-foreground">
              {task.usage.inputTokens.toLocaleString()} in / {task.usage.outputTokens.toLocaleString()} out tokens
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
