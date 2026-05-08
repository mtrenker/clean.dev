import React from 'react';
import { Heading, Link, Badge } from '@/components/ui';
import { HealthIndicator } from '../health-indicator';
import type { DaemonHealth } from '../health-indicator';
import { RefreshButton } from '../refresh-button';
import { formatRelativeTime } from '@/lib/cockpit/format';

interface ProjectDetailHeaderProps {
  projectId: string;
  projectName: string;
  projectSlug?: string | null;
  localRootPath?: string | null;
  worktreeRootPath?: string | null;
  health: DaemonHealth;
  lastHeartbeatAt?: string | null;
  lastEventAt?: string | null;
  daemonVersion?: string | null;
  /** When provided, render a "back" link to that path. */
  backHref?: string;
  backLabel?: string;
  /** Optional secondary action (e.g. config link) rendered before the refresh button. */
  primaryAction?: React.ReactNode;
}

/**
 * Coherent project drilldown header shared by `/cockpit/[projectId]/...`
 * sub-routes. Combines the breadcrumbs, daemon health badge, project
 * identifiers, observation paths, and the refresh affordance into a single
 * console-style strip so every screen feels like one continuous interface.
 */
export const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  projectId,
  projectName,
  projectSlug,
  localRootPath,
  worktreeRootPath,
  health,
  lastHeartbeatAt,
  lastEventAt,
  daemonVersion,
  backHref = '/cockpit',
  backLabel = '← All projects',
  primaryAction,
}) => {
  return (
    <header className="relative flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Link href={backHref} variant="muted">
            {backLabel}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-accent">project</span>
          <span aria-hidden="true">/</span>
          <span className="truncate text-foreground/80">
            {projectSlug ?? projectId}
          </span>
        </div>
        <Heading
          as="h1"
          variant="section"
          className="mt-2 text-2xl sm:text-3xl"
        >
          {projectName}
        </Heading>
        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
          <span>id: {projectId}</span>
          {projectSlug && projectSlug !== projectId && (
            <span>slug: {projectSlug}</span>
          )}
          {daemonVersion && (
            <Badge variant="outline">daemon v{daemonVersion}</Badge>
          )}
        </div>
        {(localRootPath || worktreeRootPath) && (
          <dl className="mt-3 grid gap-1 font-mono text-xs text-muted-foreground/85 sm:grid-cols-2">
            {localRootPath && (
              <div className="flex gap-2">
                <dt className="shrink-0 text-muted-foreground/70">repo:</dt>
                <dd className="truncate">{localRootPath}</dd>
              </div>
            )}
            {worktreeRootPath && (
              <div className="flex gap-2">
                <dt className="shrink-0 text-muted-foreground/70">worktrees:</dt>
                <dd className="truncate">{worktreeRootPath}</dd>
              </div>
            )}
          </dl>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
          <span>
            last heartbeat:{' '}
            <span className="text-foreground/80">
              {formatRelativeTime(lastHeartbeatAt)}
            </span>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            last event:{' '}
            <span className="text-foreground/80">
              {formatRelativeTime(lastEventAt)}
            </span>
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3 self-start sm:self-end">
        <HealthIndicator health={health} />
        {primaryAction}
        <RefreshButton />
      </div>
    </header>
  );
};
