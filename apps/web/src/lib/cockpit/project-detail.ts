/**
 * Per-project aggregations for the cockpit drilldown screens.
 *
 * The fleet-level helpers in `overview-aggregate.ts` answer "what is the whole
 * cockpit doing?" — these answer "what is *this* project doing?" Every helper
 * is pure: it consumes a single `CockpitProjectedProjectState` and returns
 * plain rows that the panels in `components/cockpit/project/*` render.
 */
import type {
  CockpitProjectedProjectState,
  CockpitProjectedTaskState,
  CockpitProjectedPlanState,
} from '@cleandev/cockpit-store';
import type {
  WorktreeSnapshot,
  TokenUsage,
  UsageCostEstimate,
} from '@cleandev/cockpit-protocol';
import type {
  CockpitProjectedDeviceObservationState,
  CockpitActiveFleetEntry,
} from '@cleandev/db';
import { worktreeNeedsCleanup } from './overview-aggregate';

// ─── Project-level summary strip ─────────────────────────────────────────────

export interface ProjectSummary {
  totalDevices: number;
  activeDevices: number;
  staleDevices: number;
  worktreeCount: number;
  worktreeGroups: number;
  worktreesNeedingCleanup: number;
  livePlans: number;
  archivedPlans: number;
  archivedPlansAwaitingReview: number;
  liveTasks: number;
  archivedTasks: number;
  runningTasks: number;
  failedTasks: number;
  completedTasks: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalEstimatedCostUsd: number;
}

export function buildProjectSummary(
  state: CockpitProjectedProjectState | null,
): ProjectSummary {
  const summary: ProjectSummary = {
    totalDevices: 0,
    activeDevices: 0,
    staleDevices: 0,
    worktreeCount: 0,
    worktreeGroups: 0,
    worktreesNeedingCleanup: 0,
    livePlans: 0,
    archivedPlans: 0,
    archivedPlansAwaitingReview: 0,
    liveTasks: 0,
    archivedTasks: 0,
    runningTasks: 0,
    failedTasks: 0,
    completedTasks: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalEstimatedCostUsd: 0,
  };
  if (!state) return summary;

  const devices = state.devices ?? {};
  summary.totalDevices = Object.keys(devices).length;
  summary.activeDevices = (state.activeFleet ?? []).length;
  summary.staleDevices = Math.max(0, summary.totalDevices - summary.activeDevices);

  const worktrees = Object.values(state.worktrees ?? {});
  summary.worktreeCount = worktrees.length;
  summary.worktreeGroups = Object.keys(state.worktreeGroups ?? {}).length;
  summary.worktreesNeedingCleanup = worktrees.filter(worktreeNeedsCleanup).length;

  const archivedPlanIds = new Set(state.archivedPlanIds ?? []);
  for (const plan of Object.values(state.plans ?? {})) {
    if (archivedPlanIds.has(plan.planId) || plan.source === 'archive') {
      summary.archivedPlans++;
      const status = plan.archive?.reviewStatus ?? 'pending';
      if (status === 'pending') summary.archivedPlansAwaitingReview++;
    } else {
      summary.livePlans++;
    }
  }

  const archivedTaskIds = new Set(state.archivedTaskIds ?? []);
  for (const task of Object.values(state.tasks ?? {})) {
    if (archivedTaskIds.has(task.taskId) || task.source === 'archive') {
      summary.archivedTasks++;
    } else {
      summary.liveTasks++;
    }
    if (task.status === 'running') summary.runningTasks++;
    if (task.status === 'failed') summary.failedTasks++;
    if (task.status === 'done') summary.completedTasks++;
  }

  if (state.projectUsage) {
    summary.totalInputTokens = state.projectUsage.inputTokens ?? 0;
    summary.totalOutputTokens = state.projectUsage.outputTokens ?? 0;
  }
  if (state.projectCostEstimate?.totalCost) {
    summary.totalEstimatedCostUsd = Number(state.projectCostEstimate.totalCost);
  }

  return summary;
}

// ─── Worktree groups ─────────────────────────────────────────────────────────

export interface WorktreeGroupRow {
  groupName: string;
  worktrees: WorktreeSnapshot[];
  cleanupCount: number;
  /** Devices that have most-recently observed any worktree in this group. */
  observingDeviceIds: string[];
}

/**
 * Groups worktrees by the projection's `worktreeGroups` map (which already
 * applies the project's `observation.worktrees.groupBy` rule). Worktrees that
 * are not present in any group fall under `"default"`.
 *
 * Within each group, worktrees needing cleanup are listed first.
 */
export function buildWorktreeGroupRows(
  state: CockpitProjectedProjectState | null,
): WorktreeGroupRow[] {
  if (!state) return [];

  const worktrees = state.worktrees ?? {};
  const groups = state.worktreeGroups ?? {};
  const seen = new Set<string>();
  const rows: WorktreeGroupRow[] = [];

  // Build attribution map from devices map: which device-id (if any) saw each
  // worktree. The projection doesn't carry per-worktree-per-device attribution
  // explicitly, so we fall back to "any device whose lastEvent matches the
  // worktree's lastObservedAt" — acceptable for read-only display.
  for (const [groupName, ids] of Object.entries(groups)) {
    const wts: WorktreeSnapshot[] = [];
    for (const id of ids) {
      const wt = worktrees[id];
      if (!wt || seen.has(id)) continue;
      wts.push(wt);
      seen.add(id);
    }
    if (wts.length === 0) continue;
    wts.sort((a, b) => {
      const ad = worktreeNeedsCleanup(a) ? 0 : 1;
      const bd = worktreeNeedsCleanup(b) ? 0 : 1;
      if (ad !== bd) return ad - bd;
      return (a.branch ?? a.worktreeId).localeCompare(b.branch ?? b.worktreeId);
    });
    rows.push({
      groupName,
      worktrees: wts,
      cleanupCount: wts.filter(worktreeNeedsCleanup).length,
      observingDeviceIds: deriveObservingDevices(state, wts),
    });
  }

  // Anything that survived without being assigned to a group goes under "default".
  const orphans = Object.values(worktrees).filter((wt) => !seen.has(wt.worktreeId));
  if (orphans.length > 0) {
    orphans.sort((a, b) => {
      const ad = worktreeNeedsCleanup(a) ? 0 : 1;
      const bd = worktreeNeedsCleanup(b) ? 0 : 1;
      if (ad !== bd) return ad - bd;
      return (a.branch ?? a.worktreeId).localeCompare(b.branch ?? b.worktreeId);
    });
    rows.push({
      groupName: 'default',
      worktrees: orphans,
      cleanupCount: orphans.filter(worktreeNeedsCleanup).length,
      observingDeviceIds: deriveObservingDevices(state, orphans),
    });
  }

  // Cleanup-heavy groups first, then alphabetical.
  rows.sort((a, b) => {
    if (a.cleanupCount !== b.cleanupCount) return b.cleanupCount - a.cleanupCount;
    return a.groupName.localeCompare(b.groupName);
  });
  return rows;
}

function deriveObservingDevices(
  state: CockpitProjectedProjectState,
  worktrees: WorktreeSnapshot[],
): string[] {
  const lastObserved = worktrees
    .map((wt) => (wt.lastObservedAt ? Date.parse(wt.lastObservedAt) : 0))
    .reduce((a, b) => Math.max(a, b), 0);
  if (lastObserved === 0) return [];
  const candidates: string[] = [];
  for (const dev of Object.values(state.devices ?? {})) {
    const last = dev.lastEventAt ? Date.parse(dev.lastEventAt) : 0;
    // 30s tolerance — heuristic; the projection doesn't carry exact attribution.
    if (Math.abs(last - lastObserved) <= 30_000) {
      candidates.push(dev.deviceId);
    }
  }
  return candidates;
}

// ─── Devices observing this project ──────────────────────────────────────────

export interface ProjectDeviceRow {
  device: CockpitProjectedDeviceObservationState;
  isActive: boolean;
  activeTaskCount: number;
  activePlanId?: string | null;
}

export function buildProjectDeviceRows(
  state: CockpitProjectedProjectState | null,
): ProjectDeviceRow[] {
  if (!state) return [];
  const fleetById = new Map<string, CockpitActiveFleetEntry>();
  for (const entry of state.activeFleet ?? []) {
    fleetById.set(entry.deviceId, entry);
  }
  const rows: ProjectDeviceRow[] = Object.values(state.devices ?? {}).map((d) => {
    const fleet = fleetById.get(d.deviceId);
    return {
      device: d,
      isActive: !!fleet,
      activeTaskCount: fleet?.activeTaskCount ?? d.lastHeartbeat?.activeTaskCount ?? 0,
      activePlanId: fleet?.activePlanId ?? d.lastHeartbeat?.activePlanId ?? null,
    };
  });
  rows.sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    if (a.activeTaskCount !== b.activeTaskCount) {
      return b.activeTaskCount - a.activeTaskCount;
    }
    const aTs = Date.parse(a.device.lastEventAt ?? '') || 0;
    const bTs = Date.parse(b.device.lastEventAt ?? '') || 0;
    return bTs - aTs;
  });
  return rows;
}

// ─── Tasks (live, archived, by-status) ────────────────────────────────────────

export interface TaskBuckets {
  running: CockpitProjectedTaskState[];
  failed: CockpitProjectedTaskState[];
  retrying: CockpitProjectedTaskState[];
  pending: CockpitProjectedTaskState[];
  done: CockpitProjectedTaskState[];
  archived: CockpitProjectedTaskState[];
}

export function bucketTasks(
  state: CockpitProjectedProjectState | null,
): TaskBuckets {
  const buckets: TaskBuckets = {
    running: [],
    failed: [],
    retrying: [],
    pending: [],
    done: [],
    archived: [],
  };
  if (!state) return buckets;
  const archivedIds = new Set(state.archivedTaskIds ?? []);
  for (const task of Object.values(state.tasks ?? {})) {
    if (archivedIds.has(task.taskId) || task.source === 'archive') {
      buckets.archived.push(task);
      continue;
    }
    switch (task.status) {
      case 'running':
        buckets.running.push(task);
        break;
      case 'failed':
        buckets.failed.push(task);
        break;
      case 'retrying':
        buckets.retrying.push(task);
        break;
      case 'done':
        buckets.done.push(task);
        break;
      default:
        buckets.pending.push(task);
        break;
    }
  }
  // Stable, useful default orderings.
  buckets.running.sort((a, b) =>
    Date.parse(a.startedAt ?? '') - Date.parse(b.startedAt ?? ''),
  );
  buckets.failed.sort(
    (a, b) =>
      Date.parse(b.completedAt ?? '0') - Date.parse(a.completedAt ?? '0'),
  );
  buckets.done.sort(
    (a, b) =>
      Date.parse(b.completedAt ?? '0') - Date.parse(a.completedAt ?? '0'),
  );
  buckets.archived.sort(
    (a, b) =>
      Date.parse(b.archive?.archivedAt ?? '0') -
      Date.parse(a.archive?.archivedAt ?? '0'),
  );
  return buckets;
}

// ─── Plans (live, archived) ───────────────────────────────────────────────────

export interface PlanBuckets {
  live: CockpitProjectedPlanState[];
  archived: CockpitProjectedPlanState[];
}

export function bucketPlans(
  state: CockpitProjectedProjectState | null,
): PlanBuckets {
  const buckets: PlanBuckets = { live: [], archived: [] };
  if (!state) return buckets;
  const archivedIds = new Set(state.archivedPlanIds ?? []);
  for (const plan of Object.values(state.plans ?? {})) {
    if (archivedIds.has(plan.planId) || plan.source === 'archive') {
      buckets.archived.push(plan);
    } else {
      buckets.live.push(plan);
    }
  }
  buckets.live.sort((a, b) => a.title.localeCompare(b.title));
  buckets.archived.sort(
    (a, b) =>
      Date.parse(b.archive?.archivedAt ?? '0') -
      Date.parse(a.archive?.archivedAt ?? '0'),
  );
  return buckets;
}

// ─── Cost / usage breakdown for a single project ──────────────────────────────

export interface ProjectUsageRow {
  name: string;
  usage: TokenUsage;
  estimatedCostUsd: number;
}

export interface ProjectUsageBreakdown {
  byEngine: ProjectUsageRow[];
  byModel: ProjectUsageRow[];
  byProfile: ProjectUsageRow[];
  totalUsage: TokenUsage;
  totalEstimatedCostUsd: number;
}

function sortUsage(rows: ProjectUsageRow[]): ProjectUsageRow[] {
  return rows.sort((a, b) => {
    if (b.estimatedCostUsd !== a.estimatedCostUsd) {
      return b.estimatedCostUsd - a.estimatedCostUsd;
    }
    const aTotal = a.usage.inputTokens + a.usage.outputTokens;
    const bTotal = b.usage.inputTokens + b.usage.outputTokens;
    return bTotal - aTotal;
  });
}

export function buildProjectUsageBreakdown(
  state: CockpitProjectedProjectState | null,
): ProjectUsageBreakdown {
  const empty: ProjectUsageBreakdown = {
    byEngine: [],
    byModel: [],
    byProfile: [],
    totalUsage: { inputTokens: 0, outputTokens: 0 },
    totalEstimatedCostUsd: 0,
  };
  if (!state) return empty;

  const tasks = Object.values(state.tasks ?? {});
  const costByDim: Record<'engine' | 'model' | 'profile', Map<string, number>> = {
    engine: new Map(),
    model: new Map(),
    profile: new Map(),
  };

  for (const task of tasks) {
    const exec = task.execution ?? {};
    const cost = Number(task.costEstimate?.totalCost ?? 0);
    if (exec.engine)
      costByDim.engine.set(
        exec.engine,
        (costByDim.engine.get(exec.engine) ?? 0) + cost,
      );
    if (exec.model)
      costByDim.model.set(
        exec.model,
        (costByDim.model.get(exec.model) ?? 0) + cost,
      );
    if (exec.profile)
      costByDim.profile.set(
        exec.profile,
        (costByDim.profile.get(exec.profile) ?? 0) + cost,
      );
  }

  const byEngine = sortUsage(
    Object.entries(state.engineUsage ?? {}).map(([name, usage]) => ({
      name,
      usage,
      estimatedCostUsd: costByDim.engine.get(name) ?? 0,
    })),
  );
  const byModel = sortUsage(
    Object.entries(state.modelUsage ?? {}).map(([name, usage]) => ({
      name,
      usage,
      estimatedCostUsd: costByDim.model.get(name) ?? 0,
    })),
  );
  const byProfile = sortUsage(
    Object.entries(state.profileUsage ?? {}).map(([name, usage]) => ({
      name,
      usage,
      estimatedCostUsd: costByDim.profile.get(name) ?? 0,
    })),
  );

  return {
    byEngine,
    byModel,
    byProfile,
    totalUsage: state.projectUsage ?? { inputTokens: 0, outputTokens: 0 },
    totalEstimatedCostUsd: Number(state.projectCostEstimate?.totalCost ?? 0),
  };
}

// ─── Lookup helpers ──────────────────────────────────────────────────────────

export function findTask(
  state: CockpitProjectedProjectState | null,
  taskId: string,
): CockpitProjectedTaskState | null {
  if (!state) return null;
  return state.tasks?.[taskId] ?? null;
}

export function findPlan(
  state: CockpitProjectedProjectState | null,
  planId: string,
): CockpitProjectedPlanState | null {
  if (!state) return null;
  return state.plans?.[planId] ?? null;
}

export function isArchivedTask(
  state: CockpitProjectedProjectState | null,
  taskId: string,
): boolean {
  if (!state) return false;
  if ((state.archivedTaskIds ?? []).includes(taskId)) return true;
  return state.tasks?.[taskId]?.source === 'archive';
}

// Re-export for panels that already import this module.
export { worktreeNeedsCleanup };

// Cost helper used only by the configuration screen tests.
export type { UsageCostEstimate };
