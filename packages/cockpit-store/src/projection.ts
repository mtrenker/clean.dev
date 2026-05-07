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
  CockpitProjectedPlanState,
  CockpitProjectedProjectState,
  CockpitProjectedTaskState,
} from '@cleandev/pm';

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
    telemetry: null,
    dirty: true,
    lastEvent: null,
    lastHeartbeat: null,
    worktrees: {},
    plans: {},
    tasks: {},
  };
}

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
    worktrees: { ...state.worktrees },
    plans: { ...state.plans },
    tasks: { ...state.tasks },
  };

  for (const event of sorted) {
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
          telemetry: event.payload.telemetry ?? s.telemetry ?? null,
        };
        break;
      }

      // ── Daemon heartbeat ───────────────────────────────────────────────────
      case 'project_heartbeat': {
        s = {
          ...s,
          lastHeartbeat: {
            occurredAt: event.occurredAt,
            daemonVersion: event.payload.daemonVersion ?? null,
            activePlanId: event.payload.activePlanId ?? null,
            activeTaskCount: event.payload.activeTaskCount,
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
          execution: event.payload.execution,
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
        };
        s = { ...s, tasks: { ...s.tasks, [task.taskId]: task } };
        break;
      }

      case 'task_progressed': {
        const existing = s.tasks[event.payload.taskId];
        if (existing) {
          s = {
            ...s,
            tasks: {
              ...s.tasks,
              [event.payload.taskId]: {
                ...existing,
                latestProgress: {
                  progressStatus: event.payload.progressStatus,
                  step: event.payload.step ?? null,
                  progressVisible: event.payload.progressVisible,
                  progressAt: event.payload.progressAt,
                  latestProgressAt: event.payload.latestProgressAt ?? null,
                },
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
          usage: event.payload.usage,
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
          usage: event.payload.usage,
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
                },
              },
            };
          }
        }
        break;
      }
    }
  }

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
