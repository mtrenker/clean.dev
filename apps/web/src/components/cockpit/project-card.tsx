import React from 'react';
import type { CockpitProjectedProjectState } from '@cleandev/cockpit-store';
import type { CockpitProjectRecord } from '@cleandev/cockpit-store';
import { Card, Badge, Link } from '@/components/ui';
import { HealthIndicator, getDaemonHealth } from './health-indicator';

interface ProjectCardProps {
  project: CockpitProjectRecord;
  state: CockpitProjectedProjectState | null;
  hrefBase?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  state,
  hrefBase = '/cockpit',
}) => {
  const displayName = state?.projectName ?? project.projectName ?? project.projectSlug ?? project.projectId;
  const slug = state?.projectSlug ?? project.projectSlug;

  const health = state
    ? getDaemonHealth(state.dirty, state.lastHeartbeat != null)
    : 'offline';

  const tasks = state ? Object.values(state.tasks) : [];
  const worktrees = state ? Object.values(state.worktrees) : [];

  const runningCount = tasks.filter((t) => t.status === 'running').length;
  const failedCount = tasks.filter((t) => t.status === 'failed').length;
  const dirtyWorktreeCount = worktrees.filter(
    (w) => w.isDirty || (w.aheadCount ?? 0) > 0,
  ).length;

  return (
    <Link
      href={`${hrefBase}/${project.projectId}`}
      className="block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      ariaLabel={`View ${hrefBase === '/cockpit' ? 'cockpit' : 'demo cockpit'} for ${displayName}`}
    >
      <Card className="transition-colors hover:border-accent/50 hover:bg-card/80">
        <div className="flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-foreground">
                {displayName}
              </h2>
              {slug && slug !== displayName && (
                <p className="font-mono text-xs text-muted-foreground">
                  {slug}
                </p>
              )}
            </div>
            <HealthIndicator health={health} />
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-2">
            {runningCount > 0 && (
              <Badge variant="info">
                {runningCount} running
              </Badge>
            )}
            {failedCount > 0 && (
              <Badge variant="destructive">
                {failedCount} failed
              </Badge>
            )}
            {dirtyWorktreeCount > 0 && (
              <Badge variant="warning">
                {dirtyWorktreeCount} worktree{dirtyWorktreeCount > 1 ? 's' : ''} need cleanup
              </Badge>
            )}
            {runningCount === 0 && failedCount === 0 && dirtyWorktreeCount === 0 && state && (
              <Badge variant="muted">Idle</Badge>
            )}
            {!state && (
              <Badge variant="muted">No data</Badge>
            )}
          </div>

          {/* Heartbeat info */}
          {state?.lastHeartbeat && (
            <div className="text-xs text-muted-foreground">
              <span className="font-mono">
                {state.lastHeartbeat.daemonVersion
                  ? `v${state.lastHeartbeat.daemonVersion}`
                  : 'daemon'}
              </span>
              {state.lastHeartbeat.activeTaskCount > 0 && (
                <span className="ml-2">
                  · {state.lastHeartbeat.activeTaskCount} active task{state.lastHeartbeat.activeTaskCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
