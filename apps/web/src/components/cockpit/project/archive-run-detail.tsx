import React from 'react';
import { Badge, EmptyState, Heading, Link } from '@/components/ui';
import { ConsolePanel } from '../console-panel';
import { TaskStatusBadge } from '../task-status-badge';
import {
  formatCostUsd,
  formatDuration,
  formatNumber,
  formatRelativeTime,
} from '@/lib/cockpit/format';
import type {
  ArchiveRunRow,
  ArchiveReviewStatus,
} from '@/lib/cockpit/archive-detail';

interface ArchiveRunDetailProps {
  projectId: string;
  projectName: string;
  run: ArchiveRunRow;
}

const STATUS_VARIANT: Record<
  ArchiveReviewStatus,
  React.ComponentProps<typeof Badge>['variant']
> = {
  pending: 'warning',
  reviewed: 'success',
  dismissed: 'muted',
};

/**
 * Detail view for a single historical fleet run (group of archived plans +
 * tasks sharing the same `archive.runId`). Renders three console-panel
 * sections: run metadata, plans in the run, and tasks in the run.
 */
export const ArchiveRunDetail: React.FC<ArchiveRunDetailProps> = ({
  projectId,
  projectName,
  run,
}) => {
  const totalTokens = run.inputTokens + run.outputTokens;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border/50 pb-5">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Link href={`/cockpit/${projectId}`} variant="muted">
            ← Project
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/cockpit/${projectId}/runs`} variant="muted">
            Runs
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-accent">run</span>
          <span aria-hidden="true">/</span>
          <span className="truncate text-foreground/80">{run.runId}</span>
        </div>
        <Heading as="h1" variant="section" className="text-2xl sm:text-3xl">
          Run · {run.runId}
        </Heading>
        <p className="text-sm text-muted-foreground">
          Historical fleet run for <span className="text-foreground/85">{projectName}</span>{' '}
          combining {run.plans.length} archived plan{run.plans.length === 1 ? '' : 's'}
          {' '}and {run.tasks.length} archived task{run.tasks.length === 1 ? '' : 's'}.
        </p>
      </header>

      {/* ── Stats strip ─────────────────────────────────────────────── */}
      <section
        className="terminal-card grid grid-cols-2 divide-x divide-y divide-border/40 sm:grid-cols-4 sm:divide-y-0"
        aria-label="Run runtime metrics"
      >
        <Stat
          label="Started"
          value={formatRelativeTime(run.startedAt)}
          hint={run.startedAt ?? undefined}
        />
        <Stat
          label="Ended"
          value={formatRelativeTime(run.endedAt)}
          hint={run.endedAt ?? undefined}
        />
        <Stat
          label="Tokens"
          value={totalTokens > 0 ? formatNumber(totalTokens) : '—'}
          hint={
            totalTokens > 0
              ? `${formatNumber(run.inputTokens)} in · ${formatNumber(run.outputTokens)} out`
              : undefined
          }
        />
        <Stat
          label="Est. cost"
          value={run.costUsd > 0 ? formatCostUsd(run.costUsd) : '—'}
          tone="accent"
          hint={
            run.pendingReviews > 0
              ? `${run.pendingReviews} pending review`
              : 'all reviewed'
          }
        />
      </section>

      {/* ── Plans in run ────────────────────────────────────────────── */}
      <ConsolePanel
        title="Plans in this run"
        command={`cockpit plan ls --run ${run.runId}`}
        meta={<Badge variant="muted">{run.plans.length}</Badge>}
        flush
      >
        {run.plans.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No archived plans tied to this run"
              description="Plans without a runId aren't grouped here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border/30">
            {run.plans.map((plan) => {
              const status = (plan.archive?.reviewStatus ?? 'pending') as ArchiveReviewStatus;
              return (
                <li
                  key={plan.planId}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <Link
                        href={`/cockpit/${projectId}/plans/${encodeURIComponent(plan.planId)}`}
                        variant="muted"
                        className="text-sm font-medium text-foreground hover:text-accent"
                      >
                        {plan.title}
                      </Link>
                      <Badge variant="muted">
                        {plan.taskCount} task{plan.taskCount === 1 ? '' : 's'}
                      </Badge>
                      <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
                    </div>
                    <div className="mt-1 font-mono text-xs text-muted-foreground/80">
                      {plan.planId}
                      {plan.archive?.archivePath && (
                        <span className="ml-2 truncate">
                          · {plan.archive.archivePath}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {formatRelativeTime(plan.archive?.archivedAt)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </ConsolePanel>

      {/* ── Tasks in run ────────────────────────────────────────────── */}
      <ConsolePanel
        title="Tasks in this run"
        command={`cockpit task ls --run ${run.runId}`}
        meta={<Badge variant="muted">{run.tasks.length}</Badge>}
        flush
      >
        {run.tasks.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No archived tasks for this run"
              description="If the run only emitted plans, tasks won't appear here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left">Task</th>
                  <th scope="col" className="px-4 py-2 text-left">Plan</th>
                  <th scope="col" className="px-4 py-2 text-left">Agent</th>
                  <th scope="col" className="px-4 py-2 text-left">Status</th>
                  <th scope="col" className="px-4 py-2 text-right">Tokens</th>
                  <th scope="col" className="px-4 py-2 text-right">Cost</th>
                  <th scope="col" className="px-4 py-2 text-right">Runtime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {run.tasks.map((task) => {
                  const exec = task.execution ?? {};
                  const tokens =
                    (task.usage?.inputTokens ?? 0) + (task.usage?.outputTokens ?? 0);
                  const cost = Number(task.costEstimate?.totalCost ?? 0);
                  const status = (task.archive?.reviewStatus ?? 'pending') as ArchiveReviewStatus;
                  return (
                    <tr key={task.taskId} className="transition-colors hover:bg-accent/5">
                      <td className="px-4 py-2 align-top">
                        <Link
                          href={`/cockpit/${projectId}/tasks/${encodeURIComponent(task.taskId)}`}
                          variant="muted"
                          className="text-sm font-medium text-foreground hover:text-accent"
                        >
                          {task.taskName}
                        </Link>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground/80">
                          {task.taskId}
                        </div>
                      </td>
                      <td className="px-4 py-2 align-top font-mono text-xs">
                        <Link
                          href={`/cockpit/${projectId}/plans/${encodeURIComponent(task.planId)}`}
                          variant="muted"
                        >
                          {task.planId}
                        </Link>
                      </td>
                      <td className="px-4 py-2 align-top font-mono text-xs">
                        <div className="flex flex-wrap gap-1">
                          {exec.model && (
                            <span className="rounded-sm border border-border/60 bg-muted/30 px-1.5 py-0.5 text-muted-foreground">
                              {exec.model}
                            </span>
                          )}
                          {exec.profile && (
                            <span className="rounded-sm border border-border/60 bg-muted/30 px-1.5 py-0.5 text-muted-foreground">
                              {exec.profile}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <TaskStatusBadge status={task.status ?? 'pending'} />
                        <div className="mt-1">
                          <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                        {tokens > 0 ? formatNumber(tokens) : '—'}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground/85">
                        {cost > 0 ? formatCostUsd(cost) : '—'}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                        {task.durationMs != null ? formatDuration(task.durationMs) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ConsolePanel>
    </div>
  );
};

interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'accent';
}

const Stat: React.FC<StatProps> = ({ label, value, hint, tone }) => (
  <div className="flex flex-col gap-1 px-4 py-3">
    <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
      {label}
    </span>
    <span
      className={
        tone === 'accent'
          ? 'font-mono text-xl font-semibold tabular-nums text-accent'
          : 'font-mono text-xl font-semibold tabular-nums text-foreground'
      }
    >
      {value}
    </span>
    {hint && (
      <span className="truncate font-mono text-xs text-muted-foreground">
        {hint}
      </span>
    )}
  </div>
);
