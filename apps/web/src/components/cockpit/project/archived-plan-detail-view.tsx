import React from 'react';
import { Badge, EmptyState, Heading, Link } from '@/components/ui';
import { ConsolePanel } from '../console-panel';
import { TaskStatusBadge } from '../task-status-badge';
import type {
  CockpitProjectedPlanState,
  CockpitProjectedTaskState,
} from '@cleandev/cockpit-store';
import {
  formatCostUsd,
  formatDuration,
  formatNumber,
  formatRelativeTime,
} from '@/lib/cockpit/format';
import { ArchiveReviewForm } from './archive-review-form';
import type { PlanTasksBucket } from '@/lib/cockpit/archive-detail';

interface ArchivedPlanDetailViewProps {
  plan: CockpitProjectedPlanState;
  projectId: string;
  tasks: PlanTasksBucket;
  /** True when this plan came from `.pi/archive/`. */
  isArchived: boolean;
}

const STATUS_VARIANT: Record<
  'pending' | 'reviewed' | 'dismissed',
  React.ComponentProps<typeof Badge>['variant']
> = {
  pending: 'warning',
  reviewed: 'success',
  dismissed: 'muted',
};

/**
 * Per-plan drilldown — the screen Martin opens after clicking an archived
 * plan from the project page.  It surfaces:
 *   • plan title, overview, archive metadata, run id (link to /runs/[id])
 *   • runtime metrics rolled up across the plan's tasks
 *   • the list of archived tasks (linking to per-task detail) plus any live
 *     tasks that share the planId so an operator can compare what shipped
 *     against what is currently running for the same plan
 *   • the review form (Mark reviewed / Dismiss / Re-open)
 *
 * Rendered as a coherent extension of the existing cockpit blueprint theme
 * (ConsolePanel, monospace headers, terminal-card shells).
 */
export const ArchivedPlanDetailView: React.FC<ArchivedPlanDetailViewProps> = ({
  plan,
  projectId,
  tasks,
  isArchived,
}) => {
  const archive = plan.archive ?? null;
  const archivedTasks = tasks.archived;
  const liveTasks = tasks.live;

  const totals = sumTotals([...archivedTasks, ...liveTasks], plan);
  const runId = archive?.runId ?? null;
  const reviewStatus = (archive?.reviewStatus ?? 'pending') as
    | 'pending'
    | 'reviewed'
    | 'dismissed';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border/50 pb-5">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Link href={`/cockpit/${projectId}`} variant="muted">
            ← Project
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/cockpit/${projectId}/archive`} variant="muted">
            Archive
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-accent">plan</span>
          <span aria-hidden="true">/</span>
          <span className="truncate text-foreground/80">{plan.planId}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Heading as="h1" variant="section" className="text-2xl sm:text-3xl">
              {plan.title}
            </Heading>
            <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              <Badge variant="muted">
                {plan.taskCount} task{plan.taskCount === 1 ? '' : 's'}
              </Badge>
              {isArchived && <Badge variant="outline">archive</Badge>}
              {plan.source && plan.source !== 'live' && (
                <Badge variant="outline">{plan.source}</Badge>
              )}
              {archive?.reviewStatus && (
                <Badge variant={STATUS_VARIANT[reviewStatus]}>
                  review: {reviewStatus}
                </Badge>
              )}
              {runId && (
                <Link
                  href={`/cockpit/${projectId}/runs/${encodeURIComponent(runId)}`}
                  variant="muted"
                >
                  run · {runId}
                </Link>
              )}
            </div>
          </div>
        </div>
        {plan.overview && (
          <p className="max-w-3xl whitespace-pre-wrap text-sm text-muted-foreground">
            {plan.overview}
          </p>
        )}
      </header>

      {/* ── Stats strip ─────────────────────────────────────────────── */}
      <section
        className="terminal-card grid grid-cols-2 divide-x divide-y divide-border/40 sm:grid-cols-4 sm:divide-y-0"
        aria-label="Plan runtime metrics"
      >
        <Stat
          label="Archived tasks"
          value={formatNumber(archivedTasks.length)}
          hint={`${tasks.pendingReviewCount} pending review`}
        />
        <Stat
          label="Live tasks"
          value={formatNumber(liveTasks.length)}
          hint={
            liveTasks.length > 0
              ? 'overlapping with this plan'
              : 'no current activity'
          }
          tone={liveTasks.length > 0 ? 'info' : 'default'}
        />
        <Stat
          label="Tokens"
          value={
            totals.totalTokens > 0 ? formatNumber(totals.totalTokens) : '—'
          }
          hint={
            totals.totalTokens > 0
              ? `${formatNumber(totals.inputTokens)} in · ${formatNumber(totals.outputTokens)} out`
              : undefined
          }
        />
        <Stat
          label="Est. cost"
          value={totals.costUsd > 0 ? formatCostUsd(totals.costUsd) : '—'}
          tone="accent"
        />
      </section>

      {/* ── Plan archive metadata ───────────────────────────────────── */}
      {archive && (
        <ConsolePanel
          title="Archive metadata"
          command="cat .pi/archive/.../archive-entry.json"
        >
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 font-mono text-xs sm:grid-cols-2">
            <Field label="Archive id" value={archive.archiveId ?? null} />
            <Field label="Run id" value={runId} />
            <Field
              label="Archived"
              value={
                archive.archivedAt
                  ? `${archive.archivedAt} · ${formatRelativeTime(archive.archivedAt)}`
                  : null
              }
            />
            <Field label="Path" value={archive.archivePath ?? null} />
            <Field label="Reviewed" value={archive.reviewedAt ?? null} />
            <Field label="Source path" value={plan.sourcePlanPath ?? null} />
            {archive.reviewNotes && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground/70">Review notes</dt>
                <dd className="mt-1 whitespace-pre-wrap text-foreground/85">
                  {archive.reviewNotes}
                </dd>
              </div>
            )}
          </dl>
        </ConsolePanel>
      )}

      {/* ── Tasks for this plan ─────────────────────────────────────── */}
      <ConsolePanel
        title={isArchived ? 'Archived tasks' : 'Tasks'}
        command={`cockpit task ls --plan ${plan.planId}`}
        meta={
          archivedTasks.length > 0 ? (
            <Badge variant="muted">{archivedTasks.length}</Badge>
          ) : null
        }
        flush
      >
        {archivedTasks.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No archived tasks for this plan"
              description="Tasks emitted under this plan will surface here when the planner archives them."
            />
          </div>
        ) : (
          <PlanTaskTable tasks={archivedTasks} projectId={projectId} archived />
        )}
      </ConsolePanel>

      {liveTasks.length > 0 && (
        <ConsolePanel
          title="Live tasks (compare)"
          command={`cockpit task ls --plan ${plan.planId} --live`}
          meta={<Badge variant="info">{liveTasks.length}</Badge>}
          flush
        >
          <PlanTaskTable tasks={liveTasks} projectId={projectId} archived={false} />
        </ConsolePanel>
      )}

      {/* ── Review verdict form ─────────────────────────────────────── */}
      {isArchived && (
        <ArchiveReviewForm
          target={{ kind: 'plan', projectId, planId: plan.planId }}
          currentStatus={reviewStatus}
          currentNotes={archive?.reviewNotes ?? null}
          reviewedAt={archive?.reviewedAt ?? null}
        />
      )}
    </div>
  );
};

// ── Internal helpers ────────────────────────────────────────────────────────

interface PlanTaskTableProps {
  tasks: CockpitProjectedTaskState[];
  projectId: string;
  archived: boolean;
}

const PlanTaskTable: React.FC<PlanTaskTableProps> = ({ tasks, projectId, archived }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="border-b border-border/50 bg-muted/30 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <tr>
          <th scope="col" className="px-4 py-2 text-left">Task</th>
          <th scope="col" className="px-4 py-2 text-left">Status</th>
          <th scope="col" className="px-4 py-2 text-left">Agent</th>
          <th scope="col" className="px-4 py-2 text-right">Tokens</th>
          <th scope="col" className="px-4 py-2 text-right">Runtime</th>
          <th scope="col" className="px-4 py-2 text-right">When</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/30">
        {tasks.map((task) => {
          const exec = task.execution ?? {};
          const tokens =
            (task.usage?.inputTokens ?? 0) + (task.usage?.outputTokens ?? 0);
          const taskHref = `/cockpit/${projectId}/tasks/${encodeURIComponent(task.taskId)}`;
          const reviewStatus = task.archive?.reviewStatus;
          const when = archived
            ? task.archive?.archivedAt ?? task.completedAt
            : task.completedAt ?? task.startedAt;
          return (
            <tr key={task.taskId} className="transition-colors hover:bg-accent/5">
              <td className="px-4 py-2 align-top">
                <Link
                  href={taskHref}
                  variant="muted"
                  className="text-sm font-medium text-foreground hover:text-accent"
                >
                  {task.taskName}
                </Link>
                <div className="mt-0.5 font-mono text-xs text-muted-foreground/80">
                  {task.taskId}
                </div>
              </td>
              <td className="px-4 py-2 align-top">
                <TaskStatusBadge status={task.status ?? 'pending'} />
                {archived && reviewStatus && (
                  <div className="mt-1">
                    <Badge variant={STATUS_VARIANT[reviewStatus]}>
                      review: {reviewStatus}
                    </Badge>
                  </div>
                )}
              </td>
              <td className="px-4 py-2 align-top">
                <div className="flex flex-wrap gap-1 font-mono text-xs">
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
                  {!exec.model && !exec.profile && (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                {tokens > 0 ? formatNumber(tokens) : '—'}
              </td>
              <td className="px-4 py-2 text-right align-top font-mono text-xs tabular-nums text-muted-foreground">
                {task.durationMs != null ? formatDuration(task.durationMs) : '—'}
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
);

interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'accent' | 'info';
}

const Stat: React.FC<StatProps> = ({ label, value, hint, tone }) => {
  const toneCls =
    tone === 'accent'
      ? 'text-accent'
      : tone === 'info'
        ? 'text-info'
        : 'text-foreground';
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <span className={`font-mono text-xl font-semibold tabular-nums ${toneCls}`}>
        {value}
      </span>
      {hint && (
        <span className="font-mono text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  );
};

interface FieldProps {
  label: string;
  value: string | null | undefined;
}

const Field: React.FC<FieldProps> = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-muted-foreground/70">{label}</dt>
    <dd className="mt-0.5 truncate text-foreground/90">{value ?? '—'}</dd>
  </div>
);

function sumTotals(
  tasks: CockpitProjectedTaskState[],
  plan: CockpitProjectedPlanState,
): {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
} {
  let inputTokens = 0;
  let outputTokens = 0;
  let costUsd = 0;
  for (const task of tasks) {
    inputTokens += task.usage?.inputTokens ?? 0;
    outputTokens += task.usage?.outputTokens ?? 0;
    costUsd += Number(task.costEstimate?.totalCost ?? 0);
  }
  if (inputTokens === 0 && plan.usage?.inputTokens) {
    inputTokens = plan.usage.inputTokens;
  }
  if (outputTokens === 0 && plan.usage?.outputTokens) {
    outputTokens = plan.usage.outputTokens;
  }
  if (costUsd === 0 && plan.costEstimate?.totalCost) {
    costUsd = Number(plan.costEstimate.totalCost);
  }
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    costUsd,
  };
}
