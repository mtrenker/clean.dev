import React from 'react';
import { Badge, EmptyState, Heading, Link } from '@/components/ui';
import { ConsolePanel } from '../console-panel';
import {
  formatCostUsd,
  formatNumber,
  formatRelativeTime,
} from '@/lib/cockpit/format';
import type {
  ArchivedPlanDetailRow,
  ArchivedTaskDetailRow,
  ArchiveRunRow,
  ArchiveReviewStatus,
} from '@/lib/cockpit/archive-detail';

interface ArchiveOverviewProps {
  projectId: string;
  projectName: string;
  plans: ArchivedPlanDetailRow[];
  tasks: ArchivedTaskDetailRow[];
  runs: ArchiveRunRow[];
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
 * Archive index — a coherent review surface listing every archived plan,
 * archived task, and historical fleet run for the project.  Pending reviews
 * are surfaced first; everything links to the appropriate drilldown so an
 * operator can read the original task markdown and handover summary without
 * touching the filesystem.
 */
export const ArchiveOverview: React.FC<ArchiveOverviewProps> = ({
  projectId,
  projectName,
  plans,
  tasks,
  runs,
}) => {
  const pendingPlans = plans.filter((row) => row.reviewStatus === 'pending').length;
  const pendingTasks = tasks.filter((row) => row.reviewStatus === 'pending').length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border/50 pb-5">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Link href={`/cockpit/${projectId}`} variant="muted">
            ← Project
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-accent">archive</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Heading as="h1" variant="section" className="text-2xl sm:text-3xl">
              Archive · {projectName}
            </Heading>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Every plan and task ever archived for this project.  Plans
              waiting on a review appear first.  Click any row to read the
              original task markdown and handover summary.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/cockpit/${projectId}/runs`}
              variant="muted"
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-transparent px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              ⏵ Historical runs
            </Link>
          </div>
        </div>
      </header>

      {/* ── Strip ────────────────────────────────────────────────────── */}
      <section
        className="terminal-card grid grid-cols-2 divide-x divide-y divide-border/40 sm:grid-cols-4 sm:divide-y-0"
        aria-label="Archive summary"
      >
        <Stat label="Archived plans" value={formatNumber(plans.length)} />
        <Stat
          label="Pending review"
          value={formatNumber(pendingPlans)}
          tone={pendingPlans > 0 ? 'warning' : 'default'}
          hint={`${pendingTasks} task${pendingTasks === 1 ? '' : 's'}`}
        />
        <Stat label="Archived tasks" value={formatNumber(tasks.length)} />
        <Stat label="Historical runs" value={formatNumber(runs.length)} />
      </section>

      {/* ── Plans ────────────────────────────────────────────────────── */}
      <ConsolePanel
        title="Archived plans"
        command="ls .pi/archive/plans/"
        meta={
          plans.length > 0 ? (
            <Badge variant="muted">
              {plans.length} plan{plans.length === 1 ? '' : 's'}
            </Badge>
          ) : null
        }
        flush
      >
        {plans.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No archived plans"
              description="Plans archived by the planner will surface here for review."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left">Plan</th>
                  <th scope="col" className="px-4 py-2 text-right">Tasks</th>
                  <th scope="col" className="px-4 py-2 text-right">Tokens</th>
                  <th scope="col" className="px-4 py-2 text-right">Cost</th>
                  <th scope="col" className="px-4 py-2 text-left">Status</th>
                  <th scope="col" className="px-4 py-2 text-right">Archived</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {plans.map((row) => {
                  const planHref = `/cockpit/${projectId}/plans/${encodeURIComponent(row.plan.planId)}`;
                  const tokens = row.inputTokens + row.outputTokens;
                  return (
                    <tr key={row.plan.planId} className="transition-colors hover:bg-accent/5">
                      <td className="px-4 py-2 align-top">
                        <Link
                          href={planHref}
                          variant="muted"
                          className="text-sm font-medium text-foreground hover:text-accent"
                        >
                          {row.plan.title}
                        </Link>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground/80">
                          {row.plan.planId}
                        </div>
                        {row.plan.archive?.archivePath && (
                          <div
                            className="mt-0.5 max-w-[44ch] truncate font-mono text-xs text-muted-foreground/70"
                            title={row.plan.archive.archivePath}
                          >
                            {row.plan.archive.archivePath}
                          </div>
                        )}
                        {row.runId && (
                          <div className="mt-0.5 font-mono text-xs text-muted-foreground/70">
                            run:{' '}
                            <Link
                              href={`/cockpit/${projectId}/runs/${encodeURIComponent(row.runId)}`}
                              variant="muted"
                            >
                              {row.runId}
                            </Link>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground">
                        {row.taskCount}
                        {row.pendingTaskCount > 0 && (
                          <span className="ml-1 text-warning">
                            ·{row.pendingTaskCount}↻
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                        {tokens > 0 ? formatNumber(tokens) : '—'}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground/85">
                        {row.costUsd > 0 ? formatCostUsd(row.costUsd) : '—'}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <Badge variant={STATUS_VARIANT[row.reviewStatus]}>
                          {row.reviewStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                        {formatRelativeTime(row.archivedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ConsolePanel>

      {/* ── Tasks ────────────────────────────────────────────────────── */}
      <ConsolePanel
        title="Archived tasks"
        command="ls .pi/archive/tasks/"
        meta={
          tasks.length > 0 ? (
            <Badge variant="muted">{tasks.length}</Badge>
          ) : null
        }
        flush
      >
        {tasks.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No archived tasks"
              description="Tasks archived by completed plans will surface here for review."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left">Task</th>
                  <th scope="col" className="px-4 py-2 text-left">Plan</th>
                  <th scope="col" className="px-4 py-2 text-left">Run</th>
                  <th scope="col" className="px-4 py-2 text-left">Status</th>
                  <th scope="col" className="px-4 py-2 text-left">Live?</th>
                  <th scope="col" className="px-4 py-2 text-right">Archived</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {tasks.map((row) => {
                  const taskHref = `/cockpit/${projectId}/tasks/${encodeURIComponent(row.task.taskId)}`;
                  return (
                    <tr key={row.task.taskId} className="transition-colors hover:bg-accent/5">
                      <td className="px-4 py-2 align-top">
                        <Link
                          href={taskHref}
                          variant="muted"
                          className="text-sm font-medium text-foreground hover:text-accent"
                        >
                          {row.task.taskName}
                        </Link>
                        <div className="mt-0.5 font-mono text-xs text-muted-foreground/80">
                          {row.task.taskId}
                        </div>
                      </td>
                      <td className="px-4 py-2 align-top font-mono text-xs">
                        <Link
                          href={`/cockpit/${projectId}/plans/${encodeURIComponent(row.task.planId)}`}
                          variant="muted"
                        >
                          {row.task.planId}
                        </Link>
                      </td>
                      <td className="px-4 py-2 align-top font-mono text-xs text-muted-foreground/85">
                        {row.runId ? (
                          <Link
                            href={`/cockpit/${projectId}/runs/${encodeURIComponent(row.runId)}`}
                            variant="muted"
                          >
                            {row.runId}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <Badge variant={STATUS_VARIANT[row.reviewStatus]}>
                          {row.reviewStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 align-top font-mono text-xs">
                        {row.hasLiveCounterpart && row.liveCounterpartTaskId ? (
                          <Link
                            href={`/cockpit/${projectId}/tasks/${encodeURIComponent(row.liveCounterpartTaskId)}`}
                            variant="muted"
                          >
                            <Badge variant="info">live ↗</Badge>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                        {formatRelativeTime(row.archivedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ConsolePanel>

      {/* ── Runs ─────────────────────────────────────────────────────── */}
      {runs.length > 0 && (
        <ConsolePanel
          title="Historical fleet runs"
          command="cat .pi/archive/index.json | jq '.[].runId'"
          meta={<Badge variant="muted">{runs.length}</Badge>}
          flush
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left">Run</th>
                  <th scope="col" className="px-4 py-2 text-right">Plans</th>
                  <th scope="col" className="px-4 py-2 text-right">Tasks</th>
                  <th scope="col" className="px-4 py-2 text-right">Tokens</th>
                  <th scope="col" className="px-4 py-2 text-right">Cost</th>
                  <th scope="col" className="px-4 py-2 text-right">Started</th>
                  <th scope="col" className="px-4 py-2 text-right">Ended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {runs.slice(0, 20).map((row) => {
                  const runHref = `/cockpit/${projectId}/runs/${encodeURIComponent(row.runId)}`;
                  const tokens = row.inputTokens + row.outputTokens;
                  return (
                    <tr key={row.runId} className="transition-colors hover:bg-accent/5">
                      <td className="px-4 py-2 align-top">
                        <Link
                          href={runHref}
                          variant="muted"
                          className="text-sm font-medium text-foreground hover:text-accent"
                        >
                          {row.runId}
                        </Link>
                        {row.pendingReviews > 0 && (
                          <div className="mt-0.5 font-mono text-xs text-warning">
                            {row.pendingReviews} pending review{row.pendingReviews === 1 ? '' : 's'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground">
                        {row.planIds.length}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground">
                        {row.taskIds.length}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                        {tokens > 0 ? formatNumber(tokens) : '—'}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-foreground/85">
                        {row.costUsd > 0 ? formatCostUsd(row.costUsd) : '—'}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                        {formatRelativeTime(row.startedAt)}
                      </td>
                      <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                        {formatRelativeTime(row.endedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ConsolePanel>
      )}
    </div>
  );
};

interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'warning' | 'accent' | 'info';
}

const TONE_CLS: Record<NonNullable<StatProps['tone']>, string> = {
  default: 'text-foreground',
  warning: 'text-warning',
  accent: 'text-accent',
  info: 'text-info',
};

const Stat: React.FC<StatProps> = ({ label, value, hint, tone }) => (
  <div className="flex flex-col gap-1 px-4 py-3">
    <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
      {label}
    </span>
    <span
      className={`font-mono text-xl font-semibold tabular-nums ${TONE_CLS[tone ?? 'default']}`}
    >
      {value}
    </span>
    {hint && (
      <span className="font-mono text-xs text-muted-foreground">{hint}</span>
    )}
  </div>
);
