/**
 * Cross-project aggregations for the Cockpit overview dashboard.
 *
 * The page receives a `Map<projectId, CockpitProjectedProjectState | null>`
 * and needs to answer fleet-wide operational questions:
 *
 *   • Which projects/devices are active?
 *   • Which agents are running right now, on which device, against which task?
 *   • Which branches/worktrees need cleanup (dirty / ahead / behind)?
 *   • Which tasks recently produced handoff summaries?
 *   • Which archived plans/tasks are still awaiting review?
 *   • Which engine/model/profile combinations are consuming the most tokens
 *     and estimated dollars?
 *
 * These helpers are pure — they take projected state and return plain data —
 * which keeps them trivially testable and re-usable from server and client.
 */
import type {
  CockpitProjectedProjectState,
  CockpitProjectedTaskState,
} from '@cleandev/cockpit-store';
import type { CockpitActiveFleetEntry } from '@cleandev/db';
import type {
  WorktreeSnapshot,
  TokenUsage,
  UsageCostEstimate,
} from '@cleandev/cockpit-protocol';

type ProjectStateMap = Map<string, CockpitProjectedProjectState | null>;

// ─── Fleet-wide totals shown in the HUD strip ──────────────────────────────────

export interface FleetOverview {
  totalProjects: number;
  activeProjects: number;
  staleProjects: number;
  offlineProjects: number;
  activeDeviceCount: number;
  totalDeviceCount: number;
  runningAgents: number;
  failedTasks: number;
  worktreesNeedingCleanup: number;
  archivedPlansAwaitingReview: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalEstimatedCostUsd: number;
}

export function buildFleetOverview(stateMap: ProjectStateMap): FleetOverview {
  const overview: FleetOverview = {
    totalProjects: stateMap.size,
    activeProjects: 0,
    staleProjects: 0,
    offlineProjects: 0,
    activeDeviceCount: 0,
    totalDeviceCount: 0,
    runningAgents: 0,
    failedTasks: 0,
    worktreesNeedingCleanup: 0,
    archivedPlansAwaitingReview: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalEstimatedCostUsd: 0,
  };

  for (const state of stateMap.values()) {
    if (!state) {
      overview.offlineProjects++;
      continue;
    }
    if (!state.dirty) {
      overview.activeProjects++;
    } else if (state.lastHeartbeat != null) {
      overview.staleProjects++;
    } else {
      overview.offlineProjects++;
    }

    const devices = state.devices ?? {};
    overview.totalDeviceCount += Object.keys(devices).length;
    overview.activeDeviceCount += (state.activeFleet ?? []).length;

    for (const task of Object.values(state.tasks ?? {})) {
      if (task.status === 'running') overview.runningAgents++;
      if (task.status === 'failed') overview.failedTasks++;
    }

    for (const wt of Object.values(state.worktrees ?? {})) {
      if (worktreeNeedsCleanup(wt)) overview.worktreesNeedingCleanup++;
    }

    for (const planId of state.archivedPlanIds ?? []) {
      const plan = state.plans?.[planId];
      if (
        plan?.archive?.reviewStatus === undefined ||
        plan?.archive?.reviewStatus === 'pending'
      ) {
        overview.archivedPlansAwaitingReview++;
      }
    }

    if (state.projectUsage) {
      overview.totalInputTokens += state.projectUsage.inputTokens ?? 0;
      overview.totalOutputTokens += state.projectUsage.outputTokens ?? 0;
    }
    if (state.projectCostEstimate?.totalCost) {
      overview.totalEstimatedCostUsd += Number(
        state.projectCostEstimate.totalCost,
      );
    }
  }

  return overview;
}

// ─── Active devices (one row per active device, across projects) ───────────────

export interface ActiveDeviceRow extends CockpitActiveFleetEntry {
  projectId: string;
  projectName: string;
  projectSlug?: string | null;
}

export function buildActiveDeviceRows(stateMap: ProjectStateMap): ActiveDeviceRow[] {
  const rows: ActiveDeviceRow[] = [];
  for (const [projectId, state] of stateMap.entries()) {
    if (!state) continue;
    const projectName =
      state.projectName ?? state.projectSlug ?? projectId;
    for (const entry of state.activeFleet ?? []) {
      rows.push({
        ...entry,
        projectId,
        projectName,
        projectSlug: state.projectSlug ?? null,
      });
    }
  }
  rows.sort((a, b) => {
    if (b.activeTaskCount !== a.activeTaskCount) {
      return b.activeTaskCount - a.activeTaskCount;
    }
    return Date.parse(b.lastHeartbeatAt) - Date.parse(a.lastHeartbeatAt);
  });
  return rows;
}

// ─── Running agents (one row per running task, across projects) ────────────────

export interface RunningAgentRow {
  projectId: string;
  projectName: string;
  task: CockpitProjectedTaskState;
  deviceId?: string | null;
  startedAt?: string | null;
  durationMs?: number | null;
  latestStep?: string | null;
}

export function buildRunningAgentRows(
  stateMap: ProjectStateMap,
  now: number = Date.now(),
): RunningAgentRow[] {
  const rows: RunningAgentRow[] = [];
  for (const [projectId, state] of stateMap.entries()) {
    if (!state) continue;
    const projectName =
      state.projectName ?? state.projectSlug ?? projectId;
    for (const task of Object.values(state.tasks ?? {})) {
      if (task.status !== 'running') continue;
      const startedAt = task.startedAt ?? null;
      const durationMs =
        startedAt != null ? Math.max(0, now - Date.parse(startedAt)) : null;
      rows.push({
        projectId,
        projectName,
        task,
        deviceId: state.lastEvent?.deviceId ?? null,
        startedAt,
        durationMs,
        latestStep: task.latestProgress?.step ?? null,
      });
    }
  }
  // Longest-running first (oldest startedAt).
  rows.sort((a, b) => {
    const aStart = a.startedAt ? Date.parse(a.startedAt) : Infinity;
    const bStart = b.startedAt ? Date.parse(b.startedAt) : Infinity;
    return aStart - bStart;
  });
  return rows;
}

// ─── Worktree hygiene (dirty / ahead / behind) ────────────────────────────────

export interface WorktreeHygieneRow {
  projectId: string;
  projectName: string;
  worktree: WorktreeSnapshot;
  reasons: Array<'dirty' | 'untracked' | 'ahead' | 'behind' | 'diverged'>;
}

export function worktreeNeedsCleanup(wt: WorktreeSnapshot): boolean {
  return (
    wt.isDirty ||
    (wt.untrackedCount ?? 0) > 0 ||
    (wt.aheadCount ?? 0) > 0 ||
    (wt.behindCount ?? 0) > 0
  );
}

export function buildWorktreeHygieneRows(
  stateMap: ProjectStateMap,
): WorktreeHygieneRow[] {
  const rows: WorktreeHygieneRow[] = [];
  for (const [projectId, state] of stateMap.entries()) {
    if (!state) continue;
    const projectName =
      state.projectName ?? state.projectSlug ?? projectId;
    for (const wt of Object.values(state.worktrees ?? {})) {
      if (!worktreeNeedsCleanup(wt)) continue;
      const reasons: WorktreeHygieneRow['reasons'] = [];
      if (wt.isDirty) reasons.push('dirty');
      if ((wt.untrackedCount ?? 0) > 0) reasons.push('untracked');
      if ((wt.aheadCount ?? 0) > 0 && (wt.behindCount ?? 0) > 0) {
        reasons.push('diverged');
      } else {
        if ((wt.aheadCount ?? 0) > 0) reasons.push('ahead');
        if ((wt.behindCount ?? 0) > 0) reasons.push('behind');
      }
      rows.push({ projectId, projectName, worktree: wt, reasons });
    }
  }
  rows.sort((a, b) => {
    // Dirty first, then by most recently observed.
    const aDirty = a.worktree.isDirty ? 0 : 1;
    const bDirty = b.worktree.isDirty ? 0 : 1;
    if (aDirty !== bDirty) return aDirty - bDirty;
    const aTs = a.worktree.lastObservedAt
      ? Date.parse(a.worktree.lastObservedAt)
      : 0;
    const bTs = b.worktree.lastObservedAt
      ? Date.parse(b.worktree.lastObservedAt)
      : 0;
    return bTs - aTs;
  });
  return rows;
}

// ─── Recent handoffs (recently completed tasks with handoff summary) ──────────

export interface RecentHandoffRow {
  projectId: string;
  projectName: string;
  task: CockpitProjectedTaskState;
}

export function buildRecentHandoffRows(
  stateMap: ProjectStateMap,
  limit = 8,
): RecentHandoffRow[] {
  const rows: RecentHandoffRow[] = [];
  for (const [projectId, state] of stateMap.entries()) {
    if (!state) continue;
    const projectName =
      state.projectName ?? state.projectSlug ?? projectId;
    for (const task of Object.values(state.tasks ?? {})) {
      if (task.status !== 'done') continue;
      // Prefer tasks that produced a handoff summary, but still surface
      // recent completions — an empty handoff is a useful signal too.
      if (!task.completedAt) continue;
      rows.push({ projectId, projectName, task });
    }
  }
  rows.sort((a, b) => {
    const aHasHandoff = a.task.handoffSummary ? 0 : 1;
    const bHasHandoff = b.task.handoffSummary ? 0 : 1;
    if (aHasHandoff !== bHasHandoff) return aHasHandoff - bHasHandoff;
    const aTs = a.task.completedAt ? Date.parse(a.task.completedAt) : 0;
    const bTs = b.task.completedAt ? Date.parse(b.task.completedAt) : 0;
    return bTs - aTs;
  });
  return rows.slice(0, limit);
}

// ─── Archive review queue ─────────────────────────────────────────────────────

export interface ArchivedPlanRow {
  projectId: string;
  projectName: string;
  planId: string;
  title: string;
  taskCount: number;
  archivedAt?: string | null;
  reviewStatus: 'pending' | 'reviewed' | 'dismissed';
  archivePath?: string | null;
  costUsd: number;
}

export function buildArchivedPlanRows(
  stateMap: ProjectStateMap,
  limit = 12,
): ArchivedPlanRow[] {
  const rows: ArchivedPlanRow[] = [];
  for (const [projectId, state] of stateMap.entries()) {
    if (!state) continue;
    const projectName =
      state.projectName ?? state.projectSlug ?? projectId;
    for (const planId of state.archivedPlanIds ?? []) {
      const plan = state.plans?.[planId];
      if (!plan) continue;
      rows.push({
        projectId,
        projectName,
        planId,
        title: plan.title,
        taskCount: plan.taskCount,
        archivedAt: plan.archive?.archivedAt ?? null,
        reviewStatus: plan.archive?.reviewStatus ?? 'pending',
        archivePath: plan.archive?.archivePath ?? null,
        costUsd: Number(plan.costEstimate?.totalCost ?? 0),
      });
    }
  }
  rows.sort((a, b) => {
    // Pending review first, then most-recent-archive first.
    const order = { pending: 0, reviewed: 2, dismissed: 1 };
    if (order[a.reviewStatus] !== order[b.reviewStatus]) {
      return order[a.reviewStatus] - order[b.reviewStatus];
    }
    const aTs = a.archivedAt ? Date.parse(a.archivedAt) : 0;
    const bTs = b.archivedAt ? Date.parse(b.archivedAt) : 0;
    return bTs - aTs;
  });
  return rows.slice(0, limit);
}

// ─── Usage / cost breakdown by engine + model + profile ──────────────────────

export interface UsageBreakdownRow {
  /** "engine • model • profile" identifier so we can group across projects. */
  key: string;
  engine: string;
  model: string;
  profile: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  /** Number of tasks that contributed to this row (for context). */
  taskCount: number;
}

export interface UsageBreakdown {
  rows: UsageBreakdownRow[];
  byEngine: Array<{ name: string; usage: TokenUsage; estimatedCostUsd: number; taskCount: number }>;
  byModel: Array<{ name: string; usage: TokenUsage; estimatedCostUsd: number; taskCount: number }>;
  byProfile: Array<{ name: string; usage: TokenUsage; estimatedCostUsd: number; taskCount: number }>;
}

const UNKNOWN = '—';

function dim(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : UNKNOWN;
}

function addUsage(target: TokenUsage, usage: TokenUsage | undefined): void {
  if (!usage) return;
  target.inputTokens += usage.inputTokens ?? 0;
  target.outputTokens += usage.outputTokens ?? 0;
}

function addCost(prev: number, cost: UsageCostEstimate | undefined): number {
  if (!cost) return prev;
  return prev + Number(cost.totalCost ?? 0);
}

export function buildUsageBreakdown(stateMap: ProjectStateMap): UsageBreakdown {
  const combined = new Map<
    string,
    { row: UsageBreakdownRow }
  >();
  const engines = new Map<
    string,
    { usage: TokenUsage; estimatedCostUsd: number; taskCount: number }
  >();
  const models = new Map<
    string,
    { usage: TokenUsage; estimatedCostUsd: number; taskCount: number }
  >();
  const profiles = new Map<
    string,
    { usage: TokenUsage; estimatedCostUsd: number; taskCount: number }
  >();

  function bumpDim(
    map: Map<string, { usage: TokenUsage; estimatedCostUsd: number; taskCount: number }>,
    name: string,
    usage: TokenUsage | undefined,
    cost: UsageCostEstimate | undefined,
  ) {
    let entry = map.get(name);
    if (!entry) {
      entry = {
        usage: { inputTokens: 0, outputTokens: 0 },
        estimatedCostUsd: 0,
        taskCount: 0,
      };
      map.set(name, entry);
    }
    addUsage(entry.usage, usage);
    entry.estimatedCostUsd = addCost(entry.estimatedCostUsd, cost);
    entry.taskCount++;
  }

  for (const state of stateMap.values()) {
    if (!state) continue;
    for (const task of Object.values(state.tasks ?? {})) {
      const exec = task.execution ?? {};
      const engine = dim(exec.engine);
      const model = dim(exec.model);
      const profile = dim(exec.profile);
      const key = `${engine} · ${model} · ${profile}`;

      let bucket = combined.get(key);
      if (!bucket) {
        bucket = {
          row: {
            key,
            engine,
            model,
            profile,
            inputTokens: 0,
            outputTokens: 0,
            estimatedCostUsd: 0,
            taskCount: 0,
          },
        };
        combined.set(key, bucket);
      }
      bucket.row.inputTokens += task.usage?.inputTokens ?? 0;
      bucket.row.outputTokens += task.usage?.outputTokens ?? 0;
      bucket.row.estimatedCostUsd += Number(task.costEstimate?.totalCost ?? 0);
      bucket.row.taskCount++;

      bumpDim(engines, engine, task.usage, task.costEstimate);
      bumpDim(models, model, task.usage, task.costEstimate);
      bumpDim(profiles, profile, task.usage, task.costEstimate);
    }
  }

  const rows = Array.from(combined.values()).map((b) => b.row);
  rows.sort((a, b) => {
    if (b.estimatedCostUsd !== a.estimatedCostUsd) {
      return b.estimatedCostUsd - a.estimatedCostUsd;
    }
    return b.outputTokens + b.inputTokens - (a.outputTokens + a.inputTokens);
  });

  function listFromMap(
    map: Map<string, { usage: TokenUsage; estimatedCostUsd: number; taskCount: number }>,
  ) {
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => {
        if (b.estimatedCostUsd !== a.estimatedCostUsd) {
          return b.estimatedCostUsd - a.estimatedCostUsd;
        }
        return (
          b.usage.inputTokens +
          b.usage.outputTokens -
          (a.usage.inputTokens + a.usage.outputTokens)
        );
      });
  }

  return {
    rows,
    byEngine: listFromMap(engines),
    byModel: listFromMap(models),
    byProfile: listFromMap(profiles),
  };
}
