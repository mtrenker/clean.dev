/**
 * Archive-review helpers for the cockpit project drilldown.
 *
 * Pure, side-effect-free helpers that bucket archived plans, archived tasks
 * and historical fleet runs from a `CockpitProjectedProjectState`.  They
 * answer:
 *   • which archived plans/tasks still need review?
 *   • which tasks belong to a given archived plan (and which has the same
 *     slug as a still-running live task — for "compare with live")?
 *   • how do archived plans/tasks group by `archive.runId` so an operator
 *     can replay an entire historical fleet run?
 */
import type {
  CockpitProjectedProjectState,
  CockpitProjectedTaskState,
  CockpitProjectedPlanState,
} from '@cleandev/cockpit-store';

export type ArchiveReviewStatus = 'pending' | 'reviewed' | 'dismissed';

const REVIEW_ORDER: Record<ArchiveReviewStatus, number> = {
  pending: 0,
  reviewed: 1,
  dismissed: 2,
};

// ─── Archived plan rows ──────────────────────────────────────────────────────

export interface ArchivedPlanDetailRow {
  plan: CockpitProjectedPlanState;
  reviewStatus: ArchiveReviewStatus;
  archivedAt: string | null;
  taskCount: number;
  pendingTaskCount: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  runId: string | null;
}

/**
 * Returns one row per archived plan, sorted with `pending` reviews first then
 * by `archivedAt` descending. The `taskCount` and `pendingTaskCount` are
 * computed from archived tasks whose `planId` matches the plan, so a plan
 * always shows the count of work it produced.
 */
export function buildArchivedPlanRows(
  state: CockpitProjectedProjectState | null,
): ArchivedPlanDetailRow[] {
  if (!state) return [];
  const archivedIds = new Set(state.archivedPlanIds ?? []);
  const tasksByPlan = new Map<string, CockpitProjectedTaskState[]>();
  for (const task of Object.values(state.tasks ?? {})) {
    if (!task) continue;
    const list = tasksByPlan.get(task.planId) ?? [];
    list.push(task);
    tasksByPlan.set(task.planId, list);
  }

  const rows: ArchivedPlanDetailRow[] = [];
  for (const plan of Object.values(state.plans ?? {})) {
    if (!archivedIds.has(plan.planId) && plan.source !== 'archive') continue;
    const tasks = tasksByPlan.get(plan.planId) ?? [];
    const archivedTasks = tasks.filter(
      (t) => t.source === 'archive' || (state.archivedTaskIds ?? []).includes(t.taskId),
    );
    const pending = archivedTasks.filter(
      (t) => (t.archive?.reviewStatus ?? 'pending') === 'pending',
    );
    let inputTokens = 0;
    let outputTokens = 0;
    let cost = 0;
    for (const t of tasks) {
      inputTokens += t.usage?.inputTokens ?? 0;
      outputTokens += t.usage?.outputTokens ?? 0;
      cost += Number(t.costEstimate?.totalCost ?? 0);
    }
    if (cost === 0 && plan.costEstimate?.totalCost) {
      cost = Number(plan.costEstimate.totalCost);
    }
    if (inputTokens === 0 && plan.usage?.inputTokens) {
      inputTokens = plan.usage.inputTokens;
    }
    if (outputTokens === 0 && plan.usage?.outputTokens) {
      outputTokens = plan.usage.outputTokens;
    }
    rows.push({
      plan,
      reviewStatus: (plan.archive?.reviewStatus ?? 'pending') as ArchiveReviewStatus,
      archivedAt: plan.archive?.archivedAt ?? null,
      taskCount: archivedTasks.length || tasks.length,
      pendingTaskCount: pending.length,
      inputTokens,
      outputTokens,
      costUsd: cost,
      runId: plan.archive?.runId ?? null,
    });
  }

  rows.sort((a, b) => {
    const ra = REVIEW_ORDER[a.reviewStatus];
    const rb = REVIEW_ORDER[b.reviewStatus];
    if (ra !== rb) return ra - rb;
    const at = a.archivedAt ? Date.parse(a.archivedAt) : 0;
    const bt = b.archivedAt ? Date.parse(b.archivedAt) : 0;
    return bt - at;
  });
  return rows;
}

// ─── Archived task rows ──────────────────────────────────────────────────────

export interface ArchivedTaskDetailRow {
  task: CockpitProjectedTaskState;
  reviewStatus: ArchiveReviewStatus;
  archivedAt: string | null;
  runId: string | null;
  /** True when a live, non-archived task with the same slug exists. */
  hasLiveCounterpart: boolean;
  liveCounterpartTaskId: string | null;
}

export function buildArchivedTaskRows(
  state: CockpitProjectedProjectState | null,
): ArchivedTaskDetailRow[] {
  if (!state) return [];
  const archivedIds = new Set(state.archivedTaskIds ?? []);
  const allTasks = Object.values(state.tasks ?? {});
  const liveBySlug = new Map<string, CockpitProjectedTaskState>();
  for (const task of allTasks) {
    if (task.source === 'archive' || archivedIds.has(task.taskId)) continue;
    const slug = task.slug ?? task.taskName;
    if (slug && !liveBySlug.has(slug)) liveBySlug.set(slug, task);
  }

  const rows: ArchivedTaskDetailRow[] = [];
  for (const task of allTasks) {
    if (!archivedIds.has(task.taskId) && task.source !== 'archive') continue;
    const slug = task.slug ?? task.taskName;
    const live = slug ? liveBySlug.get(slug) ?? null : null;
    rows.push({
      task,
      reviewStatus: (task.archive?.reviewStatus ?? 'pending') as ArchiveReviewStatus,
      archivedAt: task.archive?.archivedAt ?? null,
      runId: task.archive?.runId ?? null,
      hasLiveCounterpart: !!live && live.taskId !== task.taskId,
      liveCounterpartTaskId: live && live.taskId !== task.taskId ? live.taskId : null,
    });
  }

  rows.sort((a, b) => {
    const ra = REVIEW_ORDER[a.reviewStatus];
    const rb = REVIEW_ORDER[b.reviewStatus];
    if (ra !== rb) return ra - rb;
    const at = a.archivedAt ? Date.parse(a.archivedAt) : 0;
    const bt = b.archivedAt ? Date.parse(b.archivedAt) : 0;
    return bt - at;
  });
  return rows;
}

// ─── Historical fleet runs (grouped by archive runId) ────────────────────────

export interface ArchiveRunRow {
  runId: string;
  /** Earliest archivedAt among plans/tasks in this run. */
  startedAt: string | null;
  /** Latest archivedAt among plans/tasks in this run. */
  endedAt: string | null;
  planIds: string[];
  taskIds: string[];
  plans: CockpitProjectedPlanState[];
  tasks: CockpitProjectedTaskState[];
  pendingReviews: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

const RUN_ID_FALLBACK = '(no run id)';

/**
 * Groups archived plans + tasks by `archive.runId`. Plans/tasks without a
 * runId are grouped under `RUN_ID_FALLBACK`. Runs are sorted by `endedAt`
 * descending so the most recent fleet run appears first.
 */
export function buildArchiveRunRows(
  state: CockpitProjectedProjectState | null,
): ArchiveRunRow[] {
  if (!state) return [];
  const archivedPlanIds = new Set(state.archivedPlanIds ?? []);
  const archivedTaskIds = new Set(state.archivedTaskIds ?? []);

  const groups = new Map<string, ArchiveRunRow>();
  const ensure = (runId: string) => {
    let row = groups.get(runId);
    if (!row) {
      row = {
        runId,
        startedAt: null,
        endedAt: null,
        planIds: [],
        taskIds: [],
        plans: [],
        tasks: [],
        pendingReviews: 0,
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
      };
      groups.set(runId, row);
    }
    return row;
  };

  for (const plan of Object.values(state.plans ?? {})) {
    if (!archivedPlanIds.has(plan.planId) && plan.source !== 'archive') continue;
    const runId = plan.archive?.runId ?? RUN_ID_FALLBACK;
    const row = ensure(runId);
    row.planIds.push(plan.planId);
    row.plans.push(plan);
    if ((plan.archive?.reviewStatus ?? 'pending') === 'pending') {
      row.pendingReviews++;
    }
    extendRunBounds(row, plan.archive?.archivedAt);
  }

  for (const task of Object.values(state.tasks ?? {})) {
    if (!archivedTaskIds.has(task.taskId) && task.source !== 'archive') continue;
    const runId = task.archive?.runId ?? RUN_ID_FALLBACK;
    const row = ensure(runId);
    row.taskIds.push(task.taskId);
    row.tasks.push(task);
    row.inputTokens += task.usage?.inputTokens ?? 0;
    row.outputTokens += task.usage?.outputTokens ?? 0;
    row.costUsd += Number(task.costEstimate?.totalCost ?? 0);
    if ((task.archive?.reviewStatus ?? 'pending') === 'pending') {
      row.pendingReviews++;
    }
    extendRunBounds(row, task.archive?.archivedAt);
  }

  const rows = [...groups.values()];
  rows.sort((a, b) => {
    const ae = a.endedAt ? Date.parse(a.endedAt) : 0;
    const be = b.endedAt ? Date.parse(b.endedAt) : 0;
    return be - ae;
  });
  return rows;
}

function extendRunBounds(row: ArchiveRunRow, isoString: string | null | undefined): void {
  if (!isoString) return;
  const ts = Date.parse(isoString);
  if (Number.isNaN(ts)) return;
  if (row.startedAt == null || ts < Date.parse(row.startedAt)) {
    row.startedAt = isoString;
  }
  if (row.endedAt == null || ts > Date.parse(row.endedAt)) {
    row.endedAt = isoString;
  }
}

export function findArchiveRun(
  state: CockpitProjectedProjectState | null,
  runId: string,
): ArchiveRunRow | null {
  const rows = buildArchiveRunRows(state);
  return rows.find((row) => row.runId === runId) ?? null;
}

// ─── Plan tasks (live vs archived) ───────────────────────────────────────────

export interface PlanTasksBucket {
  archived: CockpitProjectedTaskState[];
  live: CockpitProjectedTaskState[];
  pendingReviewCount: number;
}

/**
 * Returns the tasks for a given plan grouped into archived vs live, with the
 * archived tasks sorted "pending review first, then by archivedAt desc".
 */
export function tasksForPlan(
  state: CockpitProjectedProjectState | null,
  planId: string,
): PlanTasksBucket {
  const empty: PlanTasksBucket = { archived: [], live: [], pendingReviewCount: 0 };
  if (!state) return empty;
  const archivedIds = new Set(state.archivedTaskIds ?? []);
  for (const task of Object.values(state.tasks ?? {})) {
    if (task.planId !== planId) continue;
    if (archivedIds.has(task.taskId) || task.source === 'archive') {
      empty.archived.push(task);
      if ((task.archive?.reviewStatus ?? 'pending') === 'pending') {
        empty.pendingReviewCount++;
      }
    } else {
      empty.live.push(task);
    }
  }
  empty.archived.sort((a, b) => {
    const ra = REVIEW_ORDER[(a.archive?.reviewStatus ?? 'pending') as ArchiveReviewStatus];
    const rb = REVIEW_ORDER[(b.archive?.reviewStatus ?? 'pending') as ArchiveReviewStatus];
    if (ra !== rb) return ra - rb;
    const at = a.archive?.archivedAt ? Date.parse(a.archive.archivedAt) : 0;
    const bt = b.archive?.archivedAt ? Date.parse(b.archive.archivedAt) : 0;
    return bt - at;
  });
  empty.live.sort((a, b) => a.taskName.localeCompare(b.taskName));
  return empty;
}

// ─── Misc ────────────────────────────────────────────────────────────────────

export function isArchivedPlan(
  state: CockpitProjectedProjectState | null,
  planId: string,
): boolean {
  if (!state) return false;
  if ((state.archivedPlanIds ?? []).includes(planId)) return true;
  return state.plans?.[planId]?.source === 'archive';
}

export const ARCHIVE_RUN_ID_FALLBACK = RUN_ID_FALLBACK;
