import React from 'react';
import type { CockpitProjectedProjectState } from '@cleandev/cockpit-store';
import type { CockpitProjectRecord } from '@cleandev/cockpit-store';
import { Card, Badge, Heading, EmptyState, Link } from '@/components/ui';
import { HealthIndicator, getDaemonHealth } from './health-indicator';
import { WorktreeSummary } from './worktree-summary';
import { TasksSection } from './tasks-section';
import { RefreshButton } from './refresh-button';

interface ProjectDetailProps {
  project: CockpitProjectRecord;
  state: CockpitProjectedProjectState | null;
  backHref?: string;
}

function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return String(value);
  }
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  state,
  backHref = '/cockpit',
}) => {
  const displayName =
    state?.projectName ?? project.projectName ?? project.projectSlug ?? project.projectId;
  const slug = state?.projectSlug ?? project.projectSlug;
  const localRootPath = state?.localRootPath ?? project.localRootPath;

  const health = state
    ? getDaemonHealth(state.dirty, state.lastHeartbeat != null)
    : 'offline';

  const tasks = state ? Object.values(state.tasks) : [];
  const worktrees = state ? Object.values(state.worktrees) : [];
  const plans = state ? Object.values(state.plans) : [];

  const runningTasks = tasks.filter((t) => t.status === 'running');
  const failedTasks = tasks.filter((t) => t.status === 'failed');
  const otherTasks = tasks.filter(
    (t) => t.status !== 'running' && t.status !== 'failed',
  );

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={backHref} variant="muted" className="text-sm">
              ← All projects
            </Link>
          </div>
          <Heading as="h1" variant="section" className="mt-2 text-2xl sm:text-3xl">
            {displayName}
          </Heading>
          {slug && (
            <p className="mt-1 font-mono text-sm text-muted-foreground">{slug}</p>
          )}
          {localRootPath && (
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {localRootPath}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <HealthIndicator health={health} />
          <RefreshButton />
        </div>
      </div>

      {/* ── Heartbeat / daemon status ──────────────────────────────── */}
      <Card>
        <Heading as="h2" variant="label" className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Daemon status
        </Heading>
        {state?.lastHeartbeat ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
            <StatItem
              label="Last heartbeat"
              value={formatDateTime(state.lastHeartbeat.occurredAt)}
            />
            {state.lastHeartbeat.daemonVersion && (
              <StatItem label="Version" value={`v${state.lastHeartbeat.daemonVersion}`} mono />
            )}
            <StatItem
              label="Active tasks"
              value={String(state.lastHeartbeat.activeTaskCount)}
            />
            {state.lastHeartbeat.activePlanId && (
              <StatItem
                label="Active plan"
                value={state.lastHeartbeat.activePlanId}
                mono
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {state ? 'No heartbeat received yet.' : 'No projection data available — events may not have arrived yet.'}
          </p>
        )}
        {state?.lastEvent && (
          <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
            Last event: <span className="font-mono">{state.lastEvent.type}</span>
            {' '}at {formatDateTime(state.lastEvent.occurredAt)}
            {' '}(seq {state.lastEvent.sequence})
          </div>
        )}
      </Card>

      {/* ── Active agents / running tasks ─────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <Heading as="h2" variant="label" className="text-xs uppercase tracking-wider text-muted-foreground">
            Active agents
          </Heading>
          {runningTasks.length > 0 && (
            <Badge variant="info">{runningTasks.length} running</Badge>
          )}
        </div>
        <TasksSection tasks={runningTasks} filterStatus="running" />
      </section>

      {/* ── Failed tasks ───────────────────────────────────────────── */}
      {failedTasks.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <Heading as="h2" variant="label" className="text-xs uppercase tracking-wider text-muted-foreground">
              Failed tasks
            </Heading>
            <Badge variant="destructive">{failedTasks.length} failed</Badge>
          </div>
          <TasksSection tasks={failedTasks} filterStatus="failed" />
        </section>
      )}

      {/* ── Worktrees ─────────────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <Heading as="h2" variant="label" className="text-xs uppercase tracking-wider text-muted-foreground">
            Worktrees / branches
          </Heading>
          {worktrees.length > 0 && (
            <Badge variant="muted">{worktrees.length}</Badge>
          )}
        </div>
        <WorktreeSummary worktrees={worktrees} />
      </section>

      {/* ── Plans ─────────────────────────────────────────────────── */}
      {plans.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <Heading as="h2" variant="label" className="text-xs uppercase tracking-wider text-muted-foreground">
              Plans
            </Heading>
            <Badge variant="muted">{plans.length}</Badge>
          </div>
          <div className="space-y-3">
            {plans.map((plan) => (
              <Card key={plan.planId} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{plan.title}</p>
                    {plan.overview && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {plan.overview}
                      </p>
                    )}
                  </div>
                  <Badge variant="muted">{plan.taskCount} tasks</Badge>
                </div>
                {plan.sourcePlanPath && (
                  <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                    {plan.sourcePlanPath}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── All other tasks ───────────────────────────────────────── */}
      {otherTasks.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <Heading as="h2" variant="label" className="text-xs uppercase tracking-wider text-muted-foreground">
              Other tasks
            </Heading>
            <Badge variant="muted">{otherTasks.length}</Badge>
          </div>
          <TasksSection tasks={otherTasks} prioritiseFailed />
        </section>
      )}

      {/* ── Raw metadata ──────────────────────────────────────────── */}
      <Card>
        <Heading as="h2" variant="label" className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Project metadata
        </Heading>
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <StatItem label="Project ID" value={project.projectId} mono />
          {slug && <StatItem label="Slug" value={slug} mono />}
          <StatItem label="Created" value={formatDateTime(project.createdAt)} />
          <StatItem label="Last event" value={formatDateTime(project.latestEventAt)} />
          <StatItem
            label="Event sequence"
            value={project.latestEventSequence.toLocaleString()}
          />
          {project.projectionDirty && (
            <StatItem label="Projection" value="Pending update" />
          )}
        </div>
      </Card>
    </div>
  );
};

// ── Internal helper ──────────────────────────────────────────────────────────

interface StatItemProps {
  label: string;
  value: string;
  mono?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, mono }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className={`mt-0.5 text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{value}</dd>
  </div>
);
