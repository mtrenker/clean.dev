import React from 'react';
import { Badge, EmptyState, Heading, Link } from '@/components/ui';
import { ConsolePanel } from '../console-panel';
import { TaskStatusBadge } from '../task-status-badge';
import { ArchiveReviewForm } from './archive-review-form';
import type {
  CockpitProjectedTaskState,
  CockpitProjectedPlanState,
} from '@cleandev/cockpit-store';
import {
  formatCostUsd,
  formatDuration,
  formatNumber,
  formatRelativeTime,
} from '@/lib/cockpit/format';

interface TaskDetailViewProps {
  task: CockpitProjectedTaskState;
  plan?: CockpitProjectedPlanState | null;
  projectId: string;
  /** True when the task came from an archive event source. */
  isArchived?: boolean;
  /**
   * If a live (non-archived) task with the same slug exists, its taskId.  When
   * provided the header shows a "compare with live" link so an operator can
   * jump from an archived run to what is currently running for the same slug.
   */
  liveCounterpartTaskId?: string | null;
}

/**
 * Per-task drilldown view. Renders:
 *  • the exact task markdown (if telemetry includes detailContent)
 *  • the latest progress step + full progress history
 *  • the handoff summary and output summary (with content hashes)
 *  • runtime metrics, agent execution metadata, token usage, cost
 *  • archive metadata (when applicable)
 *
 * Designed as a coherent extension of the cockpit blueprint theme — each
 * piece of dense technical information sits in a `ConsolePanel` with a
 * monospace header and `$ command` annotation, so the screen reads as one
 * terminal mosaic rather than a generic admin form.
 */
export const TaskDetailView: React.FC<TaskDetailViewProps> = ({
  task,
  plan,
  projectId,
  isArchived,
  liveCounterpartTaskId,
}) => {
  const exec = task.execution ?? {};
  const tokens =
    (task.usage?.inputTokens ?? 0) + (task.usage?.outputTokens ?? 0);
  const cost = Number(task.costEstimate?.totalCost ?? 0);
  const archive = task.archive;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border/50 pb-5">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Link href={`/cockpit/${projectId}`} variant="muted">
            ← Project
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-accent">task</span>
          <span aria-hidden="true">/</span>
          <span className="truncate text-foreground/80">{task.taskId}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Heading as="h1" variant="section" className="text-2xl sm:text-3xl">
              {task.taskName}
            </Heading>
            <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              <TaskStatusBadge status={task.status ?? 'pending'} />
              {task.slug && <span>{task.slug}</span>}
              <span aria-hidden="true">·</span>
              <span>
                plan:{' '}
                <Link
                  href={`/cockpit/${projectId}/plans/${encodeURIComponent(task.planId)}`}
                  variant="muted"
                >
                  {plan?.title ?? task.planId}
                </Link>
              </span>
              {isArchived && <Badge variant="outline">archive</Badge>}
              {task.source && task.source !== 'live' && (
                <Badge variant="outline">{task.source}</Badge>
              )}
              {archive?.reviewStatus && (
                <Badge variant="outline">review: {archive.reviewStatus}</Badge>
              )}
              {archive?.runId && (
                <Link
                  href={`/cockpit/${projectId}/runs/${encodeURIComponent(archive.runId)}`}
                  variant="muted"
                >
                  run · {archive.runId}
                </Link>
              )}
              {liveCounterpartTaskId && (
                <Link
                  href={`/cockpit/${projectId}/tasks/${encodeURIComponent(liveCounterpartTaskId)}`}
                  variant="muted"
                  className="inline-flex items-center gap-1"
                >
                  <Badge variant="info">live ↗</Badge>
                  compare
                </Link>
              )}
            </div>
          </div>
        </div>
        {task.description && (
          <p className="max-w-3xl text-sm text-muted-foreground">
            {task.description}
          </p>
        )}
      </header>

      {/* ── Stats strip ─────────────────────────────────────────────── */}
      <section
        className="terminal-card grid grid-cols-2 divide-x divide-y divide-border/40 sm:grid-cols-4 sm:divide-y-0"
        aria-label="Task runtime metrics"
      >
        <Stat
          label="Duration"
          value={
            task.durationMs != null
              ? formatDuration(task.durationMs)
              : task.startedAt && !task.completedAt
                ? 'in progress'
                : '—'
          }
        />
        <Stat
          label="Started"
          value={formatRelativeTime(task.startedAt)}
        />
        <Stat
          label="Tokens"
          value={tokens > 0 ? formatNumber(tokens) : '—'}
          hint={
            tokens > 0
              ? `${formatNumber(task.usage?.inputTokens ?? 0)} in · ${formatNumber(task.usage?.outputTokens ?? 0)} out`
              : undefined
          }
        />
        <Stat
          label="Est. cost"
          value={cost > 0 ? formatCostUsd(cost) : '—'}
          tone="accent"
          hint={task.costEstimate?.pricingSource ?? undefined}
        />
      </section>

      {/* ── Execution metadata ──────────────────────────────────────── */}
      <ConsolePanel
        title="Agent execution"
        command="cockpit task exec --inspect"
      >
        {!exec.engine &&
        !exec.model &&
        !exec.profile &&
        !exec.agentRole &&
        !exec.thinking ? (
          <p className="font-mono text-xs text-muted-foreground">
            No execution metadata recorded.
          </p>
        ) : (
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 font-mono text-xs sm:grid-cols-3">
            <ExecField label="Agent role" value={exec.agentRole} />
            <ExecField label="Engine" value={exec.engine} />
            <ExecField label="Provider" value={exec.provider} />
            <ExecField label="Model" value={exec.model} />
            <ExecField label="Profile" value={exec.profile} />
            <ExecField label="Thinking" value={exec.thinking} />
          </dl>
        )}
      </ConsolePanel>

      {/* ── Latest progress + history ───────────────────────────────── */}
      <ConsolePanel
        title="Progress history"
        command="cat .pi/tasks/.../progress.jsonl"
        meta={
          task.progressHistory && task.progressHistory.length > 0 ? (
            <Badge variant="muted">{task.progressHistory.length} steps</Badge>
          ) : null
        }
        flush
      >
        {!task.latestProgress &&
        (!task.progressHistory || task.progressHistory.length === 0) ? (
          <div className="p-6">
            <EmptyState
              title="No progress events"
              description="Progress entries appear here as the agent emits them."
            />
          </div>
        ) : (
          <ol className="divide-y divide-border/30">
            {(task.progressHistory ?? [])
              .slice()
              .reverse()
              .map((entry, idx) => (
                <li
                  key={`${entry.progressAt}-${idx}`}
                  className="flex flex-wrap items-start gap-3 px-4 py-2 sm:px-5"
                >
                  <span
                    className={
                      'mt-1 inline-block h-2 w-2 shrink-0 rounded-full ' +
                      (entry.progressStatus === 'error'
                        ? 'bg-destructive shadow-[0_0_0_3px_hsl(var(--destructive)/0.18)]'
                        : entry.progressStatus === 'done'
                          ? 'bg-success shadow-[0_0_0_3px_hsl(var(--success)/0.18)]'
                          : 'bg-info shadow-[0_0_0_3px_hsl(var(--info)/0.18)]')
                    }
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs text-foreground/85">
                      {entry.step ?? '(unspecified step)'}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {entry.progressStatus} · {formatRelativeTime(entry.progressAt)}
                      {!entry.progressVisible && ' · hidden'}
                    </div>
                  </div>
                </li>
              ))}
          </ol>
        )}
      </ConsolePanel>

      {/* ── Error (if failed) ───────────────────────────────────────── */}
      {task.error && (
        <ConsolePanel
          title="Error"
          command="cat .pi/tasks/.../error.log"
          meta={<Badge variant="destructive">failed</Badge>}
        >
          <pre className="overflow-x-auto rounded-sm border border-destructive/30 bg-destructive/5 p-3 font-mono text-xs leading-5 text-destructive">
            {task.error}
          </pre>
        </ConsolePanel>
      )}

      {/* ── Task markdown ───────────────────────────────────────────── */}
      <ConsolePanel
        title="Task markdown"
        command={
          task.detailPath
            ? `cat ${task.detailPath}`
            : 'cat .pi/tasks/.../task.md'
        }
        meta={task.detailPath ? <Badge variant="outline">source available</Badge> : null}
      >
        {task.detailContent ? (
          <pre className="max-h-[32rem] overflow-y-auto whitespace-pre-wrap rounded-sm border border-border/40 bg-background/70 p-3 font-mono text-xs leading-5 text-foreground/90">
            {task.detailContent}
          </pre>
        ) : (
          <EmptyState
            title="Task markdown not captured"
            description={
              task.detailPath
                ? `Telemetry omitted the body. Configured path: ${task.detailPath}`
                : 'The daemon did not include the task body in its telemetry profile.'
            }
          />
        )}
      </ConsolePanel>

      {/* ── Handoff + output summaries ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ConsolePanel
          title="Handoff"
          command="cat .pi/tasks/.../handoff.md"
          meta={
            task.handoffSummary ? (
              <Badge variant="success">captured</Badge>
            ) : (
              <Badge variant="muted">none</Badge>
            )
          }
        >
          {task.handoffSummary ? (
            <>
              <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-sm border border-border/40 bg-background/70 p-3 font-mono text-xs leading-5 text-foreground/90">
                {task.handoffSummary}
              </pre>
              {task.handoffContentHash && (
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  sha256: {task.handoffContentHash.slice(0, 16)}…
                </p>
              )}
            </>
          ) : (
            <EmptyState
              title="No handoff summary"
              description="The agent did not emit a handoff document for this task."
            />
          )}
        </ConsolePanel>

        <ConsolePanel
          title="Output"
          command="cat .pi/tasks/.../output.jsonl | tail -n 100"
          meta={
            task.outputSummary ? (
              <Badge variant="info">captured</Badge>
            ) : (
              <Badge variant="muted">none</Badge>
            )
          }
        >
          {task.outputSummary ? (
            <>
              <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-sm border border-border/40 bg-background/70 p-3 font-mono text-xs leading-5 text-foreground/90">
                {task.outputSummary}
              </pre>
              {task.outputContentHash && (
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  sha256: {task.outputContentHash.slice(0, 16)}…
                </p>
              )}
            </>
          ) : (
            <EmptyState
              title="No output captured"
              description="The agent did not emit an output summary for this task."
            />
          )}
        </ConsolePanel>
      </div>

      {/* ── Archive metadata ────────────────────────────────────────── */}
      {archive && (
        <ConsolePanel
          title="Archive metadata"
          command="ls .pi/archive/tasks/"
          meta={
            <Badge
              variant={
                archive.reviewStatus === 'reviewed'
                  ? 'success'
                  : archive.reviewStatus === 'dismissed'
                    ? 'muted'
                    : 'warning'
              }
            >
              {archive.reviewStatus ?? 'pending'}
            </Badge>
          }
        >
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 font-mono text-xs sm:grid-cols-2">
            <ExecField label="Archive id" value={archive.archiveId ?? null} />
            <ExecField label="Run id" value={archive.runId ?? null} />
            <ExecField label="Path" value={archive.archivePath ?? null} />
            <ExecField
              label="Archived"
              value={archive.archivedAt ?? null}
            />
            <ExecField
              label="Reviewed"
              value={archive.reviewedAt ?? null}
            />
            {archive.reviewNotes && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground/70">Notes</dt>
                <dd className="mt-1 whitespace-pre-wrap text-foreground/85">
                  {archive.reviewNotes}
                </dd>
              </div>
            )}
          </dl>
        </ConsolePanel>
      )}

      {/* ── Review verdict (only on archived tasks) ─────────────────── */}
      {isArchived && (
        <ArchiveReviewForm
          target={{ kind: 'task', projectId, taskId: task.taskId }}
          currentStatus={(archive?.reviewStatus ?? 'pending') as
            | 'pending'
            | 'reviewed'
            | 'dismissed'}
          currentNotes={archive?.reviewNotes ?? null}
          reviewedAt={archive?.reviewedAt ?? null}
        />
      )}
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
      <span className="font-mono text-xs text-muted-foreground">
        {hint}
      </span>
    )}
  </div>
);

interface ExecFieldProps {
  label: string;
  value: string | null | undefined;
}

const ExecField: React.FC<ExecFieldProps> = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-muted-foreground/70">{label}</dt>
    <dd className="mt-0.5 truncate text-foreground/90">{value ?? '—'}</dd>
  </div>
);
