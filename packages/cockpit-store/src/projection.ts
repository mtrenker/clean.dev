/**
 * Cockpit event projection – pure fold function.
 *
 * Takes an existing {@link CockpitProjectedProjectState} and a slice of raw
 * {@link CockpitEvent}s and returns a new state with those events applied.
 *
 * Design properties:
 *   - Pure: no I/O, no side-effects, no mutations.
 *   - Idempotent: folding the same event twice is safe (the second pass is a
 *     no-op because each field converges to the same value).
 *   - Monotonic: the caller MAY pass events in any order; they are sorted
 *     ascending by sequence before processing.
 *   - Deterministic: given the same inputs the output is always identical.
 */

import { cockpitProtocolSchemaVersion } from '@cleandev/cockpit-protocol';
import type { CockpitEvent } from '@cleandev/cockpit-protocol';

import type {
  CockpitActiveFleetEntry,
  CockpitProjectedPlanState,
  CockpitProjectedProjectState,
  CockpitProjectedTaskState,
} from '@cleandev/db';

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Daemon is considered stale when no heartbeat (or last-activity event) has
 * been observed within this window.
 */
export const HEARTBEAT_STALE_MS = 60_000;

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Returns an empty initial projected state for a project that has no prior
 * projection record.
 */
export function emptyProjectedState(
  projectId: string,
): CockpitProjectedProjectState {
  return {
    schemaVersion: cockpitProtocolSchemaVersion,
    projectId,
    projectName: null,
    projectSlug: null,
    localRootPath: null,
    worktreeRootPath: null,
    telemetry: null,
    observation: null,
    dirty: true,
    lastEvent: null,
    lastHeartbeat: null,
    devices: {},
    worktrees: {},
    worktreeGroups: {},
    plans: {},
    archivedPlanIds: [],
    tasks: {},
    archivedTaskIds: [],
    activeFleet: [],
    engineUsage: {},
    modelUsage: {},
    profileUsage: {},
    projectUsage: { inputTokens: 0, outputTokens: 0 },
    projectCostEstimate: { currency: 'USD', inputCost: 0, outputCost: 0, totalCost: 0 },
  };
}

const emptyUsage = () => ({ inputTokens: 0, outputTokens: 0 });
const emptyCost = () => ({ currency: 'USD' as const, inputCost: 0, outputCost: 0, totalCost: 0 });

const appendProgressHistory = (
  history: NonNullable<CockpitProjectedTaskState['progressHistory']> | undefined,
  entry: NonNullable<CockpitProjectedTaskState['latestProgress']>,
) => ([...(history ?? []), entry]).slice(-50);

const addUsage = (
  map: Record<string, { inputTokens: number; outputTokens: number }>,
  key: string | null | undefined,
  usage: { inputTokens: number; outputTokens: number },
): void => {
  if (!key) return;
  const prev = map[key] ?? { inputTokens: 0, outputTokens: 0 };
  map[key] = {
    inputTokens: prev.inputTokens + usage.inputTokens,
    outputTokens: prev.outputTokens + usage.outputTokens,
  };
};

/**
 * Recomputes all derived views from the canonical maps (worktrees, plans, tasks, devices).
 *
 * Called once at the end of every fold pass so that derived state is always
 * consistent with the canonical state regardless of event ordering.
 */
const recomputeDerivedViews = (
  state: CockpitProjectedProjectState,
): CockpitProjectedProjectState => {
  // ── 1. worktreeGroups ────────────────────────────────────────────────────────
  const worktreeGroups: Record<string, string[]> = {};
  for (const wt of Object.values(state.worktrees)) {
    const group = wt.groupName ?? 'default';
    if (!worktreeGroups[group]) worktreeGroups[group] = [];
    worktreeGroups[group].push(wt.worktreeId);
  }

  // ── 2. archivedPlanIds ───────────────────────────────────────────────────────
  const archivedPlanIds = Object.values(state.plans)
    .filter((p) => p.source === 'archive')
    .map((p) => p.planId);

  // ── 3. archivedTaskIds ───────────────────────────────────────────────────────
  const archivedTaskIds = Object.values(state.tasks)
    .filter((t) => t.source === 'archive')
    .map((t) => t.taskId);

  // ── 4. activeFleet ───────────────────────────────────────────────────────────
  const activeFleet: CockpitActiveFleetEntry[] = [];
  for (const device of Object.values(state.devices)) {
    const hb = device.lastHeartbeat;
    if (hb && hb.activeTaskCount > 0) {
      activeFleet.push({
        deviceId: device.deviceId,
        deviceName: device.deviceName ?? null,
        instanceName: device.instanceName ?? null,
        activeTaskCount: hb.activeTaskCount,
        activePlanId: hb.activePlanId ?? null,
        lastHeartbeatAt: hb.occurredAt,
      });
    }
  }

  // ── 5. engine/model/profile usage ────────────────────────────────────────────
  const engineUsage: Record<string, { inputTokens: number; outputTokens: number }> = {};
  const modelUsage: Record<string, { inputTokens: number; outputTokens: number }> = {};
  const profileUsage: Record<string, { inputTokens: number; outputTokens: number }> = {};

  for (const task of Object.values(state.tasks)) {
    const usage = task.usage;
    if (!usage || (usage.inputTokens === 0 && usage.outputTokens === 0)) continue;
    const exec = task.execution;
    if (exec) {
      addUsage(engineUsage, exec.engine, usage);
      addUsage(modelUsage, exec.model, usage);
      addUsage(profileUsage, exec.profile, usage);
    }
  }

  // ── 6. plan/project usage & cost ─────────────────────────────────────────────
  const newPlans = { ...state.plans };
  const projectUsage = emptyUsage();
  const projectCost = emptyCost();

  for (const planId of Object.keys(newPlans)) {
    const planUsage = emptyUsage();
    const planCost = emptyCost();
    for (const task of Object.values(state.tasks)) {
      if (task.planId !== planId) continue;
      planUsage.inputTokens += task.usage?.inputTokens ?? 0;
      planUsage.outputTokens += task.usage?.outputTokens ?? 0;
      planCost.inputCost += task.costEstimate?.inputCost ?? 0;
      planCost.outputCost += task.costEstimate?.outputCost ?? 0;
      planCost.totalCost += task.costEstimate?.totalCost ?? 0;
    }
    newPlans[planId] = { ...newPlans[planId], usage: planUsage, costEstimate: planCost };
    projectUsage.inputTokens += planUsage.inputTokens;
    projectUsage.outputTokens += planUsage.outputTokens;
    projectCost.inputCost += planCost.inputCost;
    projectCost.outputCost += planCost.outputCost;
    projectCost.totalCost += planCost.totalCost;
  }

  return {
    ...state,
    plans: newPlans,
    projectUsage,
    projectCostEstimate: projectCost,
    worktreeGroups,
    archivedPlanIds,
    archivedTaskIds,
    activeFleet,
    engineUsage,
    modelUsage,
    profileUsage,
  };
};

// ── Core fold ──────────────────────────────────────────────────────────────────

/**
 * Fold a set of raw cockpit events onto an existing projected state.
 *
 * @param state            Current projected state (not mutated).
 * @param events           Raw events to apply (may be in any order; already-
 *                         applied sequences are silently skipped).
 * @param now              Wall-clock time used for staleness computation.
 *                         Defaults to `new Date()` if not supplied.
 * @param heartbeatStaleMs Window (ms) without activity after which the
 *                         returned state has `dirty = true`.  Defaults to
 *                         {@link HEARTBEAT_STALE_MS} (60 s).
 * @returns                New projected state (new object; input is not mutated).
 */
export function foldEventsIntoState(
  state: CockpitProjectedProjectState,
  events: CockpitEvent[],
  now: Date = new Date(),
  heartbeatStaleMs: number = HEARTBEAT_STALE_MS,
): CockpitProjectedProjectState {
  // Sort ascending by sequence to guarantee monotonic application.
  const sorted = [...events].sort((a, b) => a.sequence - b.sequence);

  // Shallow-clone the top-level state and its nested maps so we can update
  // them without touching the input.
  let s: CockpitProjectedProjectState = {
    ...state,
    devices: { ...state.devices },
    worktrees: { ...state.worktrees },
    worktreeGroups: { ...(state.worktreeGroups ?? {}) },
    plans: { ...state.plans },
    archivedPlanIds: [...(state.archivedPlanIds ?? [])],
    tasks: { ...state.tasks },
    archivedTaskIds: [...(state.archivedTaskIds ?? [])],
    activeFleet: [...(state.activeFleet ?? [])],
    engineUsage: { ...(state.engineUsage ?? {}) },
    modelUsage: { ...(state.modelUsage ?? {}) },
    profileUsage: { ...(state.profileUsage ?? {}) },
  };

  for (const event of sorted) {
    const existingDevice = s.devices[event.deviceId];
    s = {
      ...s,
      devices: {
        ...s.devices,
        [event.deviceId]: {
          ...(existingDevice ?? {}),
          deviceId: event.deviceId,
          deviceName: existingDevice?.deviceName ?? null,
          instanceName: existingDevice?.instanceName ?? null,
          lastEventAt: event.occurredAt,
          lastEventType: event.type,
          source: event.source,
        },
      },
    };

    // Track the most-recent event (by sequence).
    if (!s.lastEvent || event.sequence > s.lastEvent.sequence) {
      s = {
        ...s,
        lastEvent: {
          eventId: event.eventId,
          sequence: event.sequence,
          occurredAt: event.occurredAt,
          type: event.type,
          deviceId: event.deviceId,
          sessionId: event.sessionId ?? null,
          runId: event.runId ?? null,
          source: event.source,
        },
      };
    }

    switch (event.type) {
      // ── Project metadata ───────────────────────────────────────────────────
      case 'project_seen': {
        s = {
          ...s,
          projectName: event.payload.projectName ?? s.projectName ?? null,
          localRootPath: event.payload.localRootPath ?? s.localRootPath ?? null,
          worktreeRootPath: event.payload.worktreeRootPath ?? s.worktreeRootPath ?? null,
          telemetry: event.payload.telemetry ?? s.telemetry ?? null,
          observation: event.payload.observation ?? s.observation ?? null,
        };
        break;
      }

      // ── Daemon heartbeat ───────────────────────────────────────────────────
      case 'project_heartbeat': {
        const currentDevice = s.devices[event.deviceId];
        s = {
          ...s,
          lastHeartbeat: {
            occurredAt: event.occurredAt,
            daemonVersion: event.payload.daemonVersion ?? null,
            activePlanId: event.payload.activePlanId ?? null,
            activeTaskCount: event.payload.activeTaskCount,
          },
          devices: {
            ...s.devices,
            [event.deviceId]: {
              ...(currentDevice ?? {
                deviceId: event.deviceId,
                lastEventAt: event.occurredAt,
                lastEventType: event.type,
                source: event.source,
              }),
              ...event.payload.device,
              lastHeartbeat: {
                occurredAt: event.occurredAt,
                daemonVersion: event.payload.daemonVersion ?? null,
                activePlanId: event.payload.activePlanId ?? null,
                activeTaskCount: event.payload.activeTaskCount,
              },
            },
          },
        };
        break;
      }

      // ── Worktrees ──────────────────────────────────────────────────────────
      case 'worktree_seen':
      case 'worktree_changed': {
        s = {
          ...s,
          worktrees: {
            ...s.worktrees,
            [event.payload.worktree.worktreeId]: event.payload.worktree,
          },
        };
        break;
      }

      // ── Plans ──────────────────────────────────────────────────────────────
      case 'plan_seen': {
        const plan: CockpitProjectedPlanState = {
          planId: event.payload.planId,
          title: event.payload.title,
          overview: event.payload.overview ?? null,
          sourcePlanPath: event.payload.sourcePlanPath ?? null,
          splitAt: event.payload.splitAt ?? null,
          taskCount: event.payload.taskCount,
          tasks: event.payload.tasks,
          lastSeenAt: event.occurredAt,
          source: event.source,
          usage: event.payload.usage ?? s.plans[event.payload.planId]?.usage ?? emptyUsage(),
          costEstimate: event.payload.costEstimate ?? s.plans[event.payload.planId]?.costEstimate ?? emptyCost(),
          archive: event.payload.archive ?? s.plans[event.payload.planId]?.archive ?? null,
        };
        s = { ...s, plans: { ...s.plans, [plan.planId]: plan } };
        break;
      }

      // ── Tasks ──────────────────────────────────────────────────────────────
      case 'task_seen': {
        const existing = s.tasks[event.payload.taskId];
        const task: CockpitProjectedTaskState = {
          ...(existing ?? {}),
          taskId: event.payload.taskId,
          planId: event.payload.planId,
          taskName: event.payload.taskName,
          slug: event.payload.slug,
          status: existing?.status ?? 'pending',
          dependsOn: event.payload.dependsOn,
          description: event.payload.description ?? null,
          detailPath: event.payload.detailPath ?? existing?.detailPath ?? null,
          detailContent: event.payload.detailContent ?? existing?.detailContent ?? null,
          execution: event.payload.execution,
          source: event.source,
          archive: event.payload.archive ?? existing?.archive ?? null,
        };
        s = { ...s, tasks: { ...s.tasks, [task.taskId]: task } };
        break;
      }

      case 'task_started': {
        const existing = s.tasks[event.payload.taskId];
        const task: CockpitProjectedTaskState = {
          ...(existing ?? {}),
          taskId: event.payload.taskId,
          planId: event.payload.planId,
          taskName: event.payload.taskName,
          dependsOn: existing?.dependsOn ?? [],
          status: 'running',
          startedAt: event.payload.startedAt,
          execution: event.payload.execution,
          source: event.source,
          archive: event.payload.archive ?? existing?.archive ?? null,
          worktreeId: event.payload.worktreeId ?? existing?.worktreeId ?? null,
        };
        s = { ...s, tasks: { ...s.tasks, [task.taskId]: task } };
        break;
      }

      case 'task_progressed': {
        const existing = s.tasks[event.payload.taskId];
        if (existing) {
          const latestProgress = {
            progressStatus: event.payload.progressStatus,
            step: event.payload.step ?? null,
            progressVisible: event.payload.progressVisible,
            progressAt: event.payload.progressAt,
            latestProgressAt: event.payload.latestProgressAt ?? null,
          };
          s = {
            ...s,
            tasks: {
              ...s.tasks,
              [event.payload.taskId]: {
                ...existing,
                latestProgress,
                progressHistory: appendProgressHistory(existing.progressHistory, latestProgress),
              },
            },
          };
        }
        break;
      }

      case 'task_completed': {
        const existing = s.tasks[event.payload.taskId];
        const task: CockpitProjectedTaskState = {
          ...(existing ?? {}),
          taskId: event.payload.taskId,
          planId: event.payload.planId,
          taskName: event.payload.taskName,
          dependsOn: existing?.dependsOn ?? [],
          status: 'done',
          startedAt: event.payload.startedAt ?? existing?.startedAt ?? null,
          completedAt: event.payload.completedAt,
          durationMs: event.payload.durationMs ?? null,
          retries: event.payload.retries,
          usage: event.payload.usage ?? existing?.usage,
          costEstimate: event.payload.costEstimate ?? existing?.costEstimate,
          source: event.source,
          archive: event.payload.archive ?? existing?.archive ?? null,
        };
        s = { ...s, tasks: { ...s.tasks, [task.taskId]: task } };
        break;
      }

      case 'task_failed': {
        const existing = s.tasks[event.payload.taskId];
        const task: CockpitProjectedTaskState = {
          ...(existing ?? {}),
          taskId: event.payload.taskId,
          planId: event.payload.planId,
          taskName: event.payload.taskName,
          dependsOn: existing?.dependsOn ?? [],
          status: 'failed',
          startedAt: event.payload.startedAt ?? existing?.startedAt ?? null,
          completedAt: event.payload.completedAt ?? null,
          durationMs: event.payload.durationMs ?? null,
          retries: event.payload.retries,
          error: event.payload.error,
          usage: event.payload.usage ?? existing?.usage,
          costEstimate: event.payload.costEstimate ?? existing?.costEstimate,
          source: event.source,
          archive: event.payload.archive ?? existing?.archive ?? null,
        };
        s = { ...s, tasks: { ...s.tasks, [task.taskId]: task } };
        break;
      }

      case 'usage_reported': {
        if (event.payload.taskId) {
          const existing = s.tasks[event.payload.taskId];
          if (existing) {
            const prev = existing.usage ?? { inputTokens: 0, outputTokens: 0 };
            s = {
              ...s,
              tasks: {
                ...s.tasks,
                [event.payload.taskId]: {
                  ...existing,
                  usage: {
                    inputTokens: prev.inputTokens + event.payload.usage.inputTokens,
                    outputTokens: prev.outputTokens + event.payload.usage.outputTokens,
                  },
                  costEstimate: event.payload.costEstimate ?? existing.costEstimate,
                  archive: event.payload.archive ?? existing.archive ?? null,
                },
              },
            };
          }
        }
        break;
      }

      case 'task_handoff_seen': {
        const existing = s.tasks[event.payload.taskId];
        if (existing) {
          s = {
            ...s,
            tasks: {
              ...s.tasks,
              [event.payload.taskId]: {
                ...existing,
                handoffSummary: event.payload.handoffContent ?? null,
                handoffContentHash: event.payload.contentHash ?? null,
              },
            },
          };
        }
        break;
      }

      case 'task_output_seen': {
        const existing = s.tasks[event.payload.taskId];
        if (existing) {
          s = {
            ...s,
            tasks: {
              ...s.tasks,
              [event.payload.taskId]: {
                ...existing,
                outputSummary: event.payload.outputTail ?? null,
                outputContentHash: event.payload.contentHash ?? null,
              },
            },
          };
        }
        break;
      }
    }
  }

  // ── Derived views ──────────────────────────────────────────────────────────
  //
  // Recompute all derived/aggregated fields (worktreeGroups, archivedPlanIds,
  // archivedTaskIds, activeFleet, engine/model/profileUsage, plan/project usage)
  // from the canonical maps.  This is done once after all events are applied so
  // derived state is always consistent and the fold remains idempotent.
  s = recomputeDerivedViews(s);

  // ── Staleness check ────────────────────────────────────────────────────────
  //
  // Use the most-recent *activity* timestamp we can find:
  //   1. The last heartbeat (preferred – explicit daemon health signal)
  //   2. The last event time (fallback – daemon is sending data but no heartbeat yet)
  //   3. Zero (no activity at all → always stale)
  //
  // `state.dirty` in the output signals to the UI that the daemon may be
  // inactive.  It is NOT related to whether unprojected DB events exist;
  // that is tracked separately in cockpit_projects.projection_dirty.
  const heartbeatTs = s.lastHeartbeat
    ? new Date(s.lastHeartbeat.occurredAt).getTime()
    : 0;
  const lastEventTs = s.lastEvent
    ? new Date(s.lastEvent.occurredAt).getTime()
    : 0;
  const latestActivityTs = Math.max(heartbeatTs, lastEventTs);

  const isDaemonStale =
    latestActivityTs === 0 ||
    latestActivityTs < now.getTime() - heartbeatStaleMs;

  return {
    ...s,
    schemaVersion: cockpitProtocolSchemaVersion,
    dirty: isDaemonStale,
  };
}
