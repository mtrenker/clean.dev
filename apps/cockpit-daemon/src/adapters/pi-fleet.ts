import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

import {
  cockpitProtocolSchemaVersion,
  type MappedProject,
} from '@cleandev/cockpit-protocol';

import { type LocalDaemonDb, hashSnapshot } from '../local-db';

// ── Raw .pi file types ─────────────────────────────────────────────────────────

interface PlanSummaryTask {
  id: string;
  slug?: string;
  name: string;
  engine?: string | null;
  model?: string | null;
  profile?: string | null;
  thinking?: string | null;
  agent?: string | null;
  depends?: string[];
  description?: string | null;
}

interface PlanSummary {
  version?: number;
  title: string;
  overview?: string | null;
  splitAt?: string | null;
  sourcePlanPath?: string | null;
  taskCount?: number;
  tasks?: PlanSummaryTask[];
}

interface StateJsonTask {
  id: string;
  name?: string;
  agent?: string | null;
  engine?: string | null;
  model?: string | null;
  profile?: string | null;
  thinking?: string | null;
  status: 'pending' | 'running' | 'done' | 'failed' | 'retrying';
  startedAt?: string | null;
  completedAt?: string | null;
  latestProgressAt?: string | null;
  blockedBy?: string[] | null;
  usage?: { inputTokens?: number; outputTokens?: number } | null;
}

interface StateJson {
  updatedAt?: string;
  tasks: StateJsonTask[];
  summary?: {
    total?: number;
    running?: number;
    done?: number;
    failed?: number;
  };
}

interface TaskStatusJson {
  id: string;
  name: string;
  agent?: string | null;
  engine?: string | null;
  model?: string | null;
  profile?: string | null;
  thinking?: string | null;
  status: 'done' | 'failed' | 'pending' | 'running' | 'retrying';
  startedAt?: string | null;
  completedAt?: string | null;
  duration?: number | null;
  retries?: number;
  error?: string | null;
  usage?: { inputTokens?: number; outputTokens?: number } | null;
  // pid is deliberately excluded
}

interface ProgressEntry {
  ts: string;
  step?: string | null;
  status?: 'running' | 'done' | 'error';
}

interface ArchiveIndexEntry {
  id: string;
  archivedAt: string;
  reason?: string;
  title?: string;
  taskCount?: number;
  archivePath?: string;
  taskFolders?: string[];
}

interface ArchiveIndex {
  version?: number;
  archives: ArchiveIndexEntry[];
}

interface ArchiveSummaryTask {
  id: string;
  name: string;
  agent?: string | null;
  engine?: string | null;
  model?: string | null;
  profile?: string | null;
  thinking?: string | null;
  status: 'done' | 'failed' | 'pending' | 'running' | 'retrying';
  depends?: string[];
  retries?: number;
  startedAt?: string | null;
  completedAt?: string | null;
  duration?: number | null;
  error?: string | null;
  progressEntries?: number;
  lastProgress?: string | null;
  usage?: { inputTokens?: number; outputTokens?: number } | null;
}

interface ArchiveSummary {
  version?: number;
  summarizedAt?: string;
  plan: {
    title: string;
    overview?: string | null;
    splitAt?: string | null;
    sourcePlanPath?: string | null;
    taskCount?: number;
  };
  tasks: ArchiveSummaryTask[];
}

// ── Scan result ────────────────────────────────────────────────────────────────

export interface ProjectPiFleetScanResult {
  projectId: string;
  planId: string | null;
  activePlanTitle: string | null;
  activeTaskCount: number;
  queuedPlanSeenCount: number;
  queuedTaskSeenCount: number;
  queuedTaskStartedCount: number;
  queuedTaskProgressedCount: number;
  queuedTaskCompletedCount: number;
  queuedTaskFailedCount: number;
  queuedUsageReportedCount: number;
  queuedArchiveEventCount: number;
}

// ── Main adapter ───────────────────────────────────────────────────────────────

/**
 * Scans .pi files in a project directory, emitting semantic cockpit events
 * (plan_seen, task_seen, task_started, task_progressed, task_completed,
 * task_failed, usage_reported) into the local outbox.
 *
 * All event emission is idempotent: events are deduplicated against already-
 * queued outbox entries by source key + snapshot hash. Progress JSONL files are
 * tailed from the stored byte offset so events are never re-emitted after
 * daemon restart.
 */
export const scanProjectPiFleet = async (
  db: LocalDaemonDb,
  project: MappedProject,
  deviceId: string,
): Promise<ProjectPiFleetScanResult> => {
  const piDir = path.join(project.localRootPath, '.pi');
  const result: ProjectPiFleetScanResult = {
    projectId: project.projectId,
    planId: null,
    activePlanTitle: null,
    activeTaskCount: 0,
    queuedPlanSeenCount: 0,
    queuedTaskSeenCount: 0,
    queuedTaskStartedCount: 0,
    queuedTaskProgressedCount: 0,
    queuedTaskCompletedCount: 0,
    queuedTaskFailedCount: 0,
    queuedUsageReportedCount: 0,
    queuedArchiveEventCount: 0,
  };

  const now = new Date().toISOString();

  // ── 1. Active plan from plan-summary.json ────────────────────────────────────
  const planSummaryPath = path.join(piDir, 'tasks', 'plan-summary.json');
  const planSummary = await readJsonFile<PlanSummary>(planSummaryPath);

  let activePlanId: string | null = null;
  let planTaskMap: Map<string, PlanSummaryTask> = new Map();

  if (planSummary) {
    const planId = deriveActivePlanId(planSummary.title);
    activePlanId = planId;
    result.planId = planId;
    result.activePlanTitle = planSummary.title;

    const planSummaryHash = hashSnapshot(JSON.stringify(planSummary));
    const planSourceKey = `pi-fleet:${project.projectId}:plan-summary`;

    // Build a map for O(1) task lookups when processing state.json
    for (const task of planSummary.tasks ?? []) {
      planTaskMap.set(task.id, task);
    }

    // Emit plan_seen if the plan content has changed or was never seen
    const existingPlan = db.getObservedFile(project.projectId, planSourceKey);
    if (existingPlan?.snapshotHash !== planSummaryHash) {
      db.queueEvent({
        event: {
          schemaVersion: cockpitProtocolSchemaVersion,
          eventId: randomUUID(),
          occurredAt: planSummary.splitAt ?? now,
          source: 'live',
          projectId: project.projectId,
          deviceId,
          type: 'plan_seen',
          payload: {
            planId,
            title: planSummary.title,
            overview: project.telemetry.planText
              ? (planSummary.overview ?? null)
              : null,
            sourcePlanPath: planSummary.sourcePlanPath ?? null,
            splitAt: planSummary.splitAt ?? null,
            taskCount: planSummary.taskCount ?? (planSummary.tasks?.length ?? 0),
            tasks: (planSummary.tasks ?? []).map((t) =>
              buildPlanTaskSummary(t, project.telemetry.taskDescription),
            ),
          },
        },
        source: {
          filePath: planSourceKey,
          offset: 0,
          snapshotHash: planSummaryHash,
        },
      });
      result.queuedPlanSeenCount += 1;

      // Also emit task_seen for each task when the plan changes
      for (const task of planSummary.tasks ?? []) {
        const taskHash = hashSnapshot(JSON.stringify(task));
        const taskSourceKey = `pi-fleet:${project.projectId}:task-seen:${planId}:${task.id}`;
        const existingTask = db.getObservedFile(project.projectId, taskSourceKey);

        if (existingTask?.snapshotHash !== taskHash) {
          db.queueEvent({
            event: {
              schemaVersion: cockpitProtocolSchemaVersion,
              eventId: randomUUID(),
              occurredAt: planSummary.splitAt ?? now,
              source: 'live',
              projectId: project.projectId,
              deviceId,
              type: 'task_seen',
              payload: {
                planId,
                taskId: task.id,
                taskName: task.name,
                slug: task.slug,
                dependsOn: task.depends ?? [],
                description: project.telemetry.taskDescription
                  ? (task.description ?? null)
                  : null,
                execution: buildTaskExecution(task),
              },
            },
            source: {
              filePath: taskSourceKey,
              offset: 0,
              snapshotHash: taskHash,
            },
          });
          result.queuedTaskSeenCount += 1;
        }
      }
    }
  }

  // ── 2. Active task state from state.json ─────────────────────────────────────
  const stateJsonPath = path.join(piDir, 'tasks', 'state.json');
  const stateJson = await readJsonFile<StateJson>(stateJsonPath);

  if (stateJson && activePlanId) {
    const runningTasks = stateJson.tasks.filter((t) => t.status === 'running');
    result.activeTaskCount = runningTasks.length;

    for (const stateTask of stateJson.tasks) {
      const planTask = planTaskMap.get(stateTask.id);

      // Build taskName: prefer plan-summary human-readable name, fallback to state slug
      const taskName = planTask?.name ?? stateTask.name ?? stateTask.id;

      if (stateTask.status === 'running') {
        const startedAt = stateTask.startedAt ?? now;
        const startedHash = hashSnapshot(`${stateTask.id}:${startedAt}`);
        const startedKey = `pi-fleet:${project.projectId}:task-started:${activePlanId}:${stateTask.id}`;
        const existingStarted = db.getObservedFile(project.projectId, startedKey);

        if (existingStarted?.snapshotHash !== startedHash) {
          db.queueEvent({
            event: {
              schemaVersion: cockpitProtocolSchemaVersion,
              eventId: randomUUID(),
              occurredAt: startedAt,
              source: 'live',
              projectId: project.projectId,
              deviceId,
              type: 'task_started',
              payload: {
                planId: activePlanId,
                taskId: stateTask.id,
                taskName,
                status: 'running',
                startedAt,
                worktreeId: null,
                execution: buildTaskExecution(planTask ?? stateTask),
              },
            },
            source: {
              filePath: startedKey,
              offset: 0,
              snapshotHash: startedHash,
            },
          });
          result.queuedTaskStartedCount += 1;
        }

        // Tail progress.jsonl for running tasks
        const taskSlug = stateTask.name ?? stateTask.id;
        const taskDir = resolveTaskDir(piDir, stateTask.id, taskSlug);

        if (taskDir) {
          const progressed = await tailProgressJsonl(
            db,
            project,
            deviceId,
            activePlanId,
            stateTask.id,
            taskName,
            taskSlug,
            taskDir,
          );
          result.queuedTaskProgressedCount += progressed;
        }
      } else if (stateTask.status === 'done' || stateTask.status === 'failed') {
        const taskSlug = stateTask.name ?? stateTask.id;
        const taskDir = resolveTaskDir(piDir, stateTask.id, taskSlug);
        const statusJsonPath = taskDir ? path.join(taskDir, 'status.json') : null;

        // Read status.json for authoritative completed/failed data
        const statusJson = statusJsonPath
          ? await readJsonFile<TaskStatusJson>(statusJsonPath)
          : null;

        const completedAt = statusJson?.completedAt ?? stateTask.completedAt ?? now;
        const statusHash = hashSnapshot(
          JSON.stringify({
            id: stateTask.id,
            status: stateTask.status,
            completedAt,
          }),
        );

        if (stateTask.status === 'done') {
          const completedKey = `pi-fleet:${project.projectId}:task-completed:${activePlanId}:${stateTask.id}`;
          const existingCompleted = db.getObservedFile(project.projectId, completedKey);

          if (existingCompleted?.snapshotHash !== statusHash) {
            const usage =
              project.telemetry.usage && statusJson?.usage
                ? {
                    inputTokens: statusJson.usage.inputTokens ?? 0,
                    outputTokens: statusJson.usage.outputTokens ?? 0,
                  }
                : undefined;

            db.queueEvent({
              event: {
                schemaVersion: cockpitProtocolSchemaVersion,
                eventId: randomUUID(),
                occurredAt: completedAt,
                source: 'live',
                projectId: project.projectId,
                deviceId,
                type: 'task_completed',
                payload: {
                  planId: activePlanId,
                  taskId: stateTask.id,
                  taskName,
                  status: 'done',
                  startedAt: statusJson?.startedAt ?? stateTask.startedAt ?? null,
                  completedAt,
                  durationMs: statusJson?.duration ?? null,
                  retries: statusJson?.retries ?? 0,
                  usage,
                },
              },
              source: {
                filePath: completedKey,
                offset: 0,
                snapshotHash: statusHash,
              },
            });
            result.queuedTaskCompletedCount += 1;

            // Emit usage_reported independently
            if (project.telemetry.usage && statusJson?.usage) {
              const usageKey = `pi-fleet:${project.projectId}:usage-reported:${activePlanId}:${stateTask.id}`;
              const existingUsage = db.getObservedFile(project.projectId, usageKey);

              if (existingUsage?.snapshotHash !== statusHash) {
                db.queueEvent({
                  event: {
                    schemaVersion: cockpitProtocolSchemaVersion,
                    eventId: randomUUID(),
                    occurredAt: completedAt,
                    source: 'live',
                    projectId: project.projectId,
                    deviceId,
                    type: 'usage_reported',
                    payload: {
                      planId: activePlanId,
                      taskId: stateTask.id,
                      status: 'done',
                      usage: {
                        inputTokens: statusJson.usage.inputTokens ?? 0,
                        outputTokens: statusJson.usage.outputTokens ?? 0,
                      },
                    },
                  },
                  source: {
                    filePath: usageKey,
                    offset: 0,
                    snapshotHash: statusHash,
                  },
                });
                result.queuedUsageReportedCount += 1;
              }
            }
          }
        } else if (stateTask.status === 'failed') {
          const failedKey = `pi-fleet:${project.projectId}:task-failed:${activePlanId}:${stateTask.id}`;
          const existingFailed = db.getObservedFile(project.projectId, failedKey);

          if (existingFailed?.snapshotHash !== statusHash) {
            const usage =
              project.telemetry.usage && statusJson?.usage
                ? {
                    inputTokens: statusJson.usage.inputTokens ?? 0,
                    outputTokens: statusJson.usage.outputTokens ?? 0,
                  }
                : undefined;

            db.queueEvent({
              event: {
                schemaVersion: cockpitProtocolSchemaVersion,
                eventId: randomUUID(),
                occurredAt: completedAt,
                source: 'live',
                projectId: project.projectId,
                deviceId,
                type: 'task_failed',
                payload: {
                  planId: activePlanId,
                  taskId: stateTask.id,
                  taskName,
                  status: 'failed',
                  startedAt: statusJson?.startedAt ?? stateTask.startedAt ?? null,
                  completedAt,
                  durationMs: statusJson?.duration ?? null,
                  retries: statusJson?.retries ?? 0,
                  error: statusJson?.error ?? 'unknown error',
                  usage,
                },
              },
              source: {
                filePath: failedKey,
                offset: 0,
                snapshotHash: statusHash,
              },
            });
            result.queuedTaskFailedCount += 1;

            // Emit usage_reported independently
            if (project.telemetry.usage && statusJson?.usage) {
              const usageKey = `pi-fleet:${project.projectId}:usage-reported:${activePlanId}:${stateTask.id}`;
              const existingUsage = db.getObservedFile(project.projectId, usageKey);

              if (existingUsage?.snapshotHash !== statusHash) {
                db.queueEvent({
                  event: {
                    schemaVersion: cockpitProtocolSchemaVersion,
                    eventId: randomUUID(),
                    occurredAt: completedAt,
                    source: 'live',
                    projectId: project.projectId,
                    deviceId,
                    type: 'usage_reported',
                    payload: {
                      planId: activePlanId,
                      taskId: stateTask.id,
                      status: 'failed',
                      usage: {
                        inputTokens: statusJson.usage.inputTokens ?? 0,
                        outputTokens: statusJson.usage.outputTokens ?? 0,
                      },
                    },
                  },
                  source: {
                    filePath: usageKey,
                    offset: 0,
                    snapshotHash: statusHash,
                  },
                });
                result.queuedUsageReportedCount += 1;
              }
            }
          }
        }
      }
    }
  }

  // ── 3. Archive history from archive/index.json ───────────────────────────────
  const archiveIndexPath = path.join(piDir, 'archive', 'index.json');
  const archiveIndex = await readJsonFile<ArchiveIndex>(archiveIndexPath);

  if (archiveIndex) {
    for (const archiveEntry of archiveIndex.archives) {
      const archiveSourceKey = `pi-fleet:${project.projectId}:archive:${archiveEntry.id}:processed`;
      const existingArchive = db.getObservedFile(project.projectId, archiveSourceKey);

      // Skip already-processed archives (snapshotHash = "1" means processed)
      if (existingArchive?.snapshotHash === '1') {
        continue;
      }

      // Resolve archive directory: use archivePath if present, else derive from index
      const archiveDir = archiveEntry.archivePath
        ? path.join(project.localRootPath, archiveEntry.archivePath)
        : path.join(piDir, 'archive', archiveEntry.id);

      const archiveSummaryPath = path.join(archiveDir, 'archive-summary.json');
      const archiveSummary = await readJsonFile<ArchiveSummary>(archiveSummaryPath);

      if (!archiveSummary) {
        continue;
      }

      const archivePlanId = archiveEntry.id;
      const archiveOccurredAt = archiveEntry.archivedAt;
      let archiveEventsCount = 0;

      // Emit plan_seen for the archived plan
      const archivePlanKey = `pi-fleet:${project.projectId}:archive:${archiveEntry.id}:plan`;
      const existingArchivePlan = db.getObservedFile(project.projectId, archivePlanKey);

      if (!existingArchivePlan) {
        db.queueEvent({
          event: {
            schemaVersion: cockpitProtocolSchemaVersion,
            eventId: randomUUID(),
            occurredAt: archiveSummary.plan.splitAt ?? archiveOccurredAt,
            source: 'archive',
            projectId: project.projectId,
            deviceId,
            type: 'plan_seen',
            payload: {
              planId: archivePlanId,
              title: archiveSummary.plan.title,
              overview: project.telemetry.planText
                ? (archiveSummary.plan.overview ?? null)
                : null,
              sourcePlanPath: archiveSummary.plan.sourcePlanPath ?? null,
              splitAt: archiveSummary.plan.splitAt ?? null,
              taskCount: archiveSummary.plan.taskCount ?? archiveSummary.tasks.length,
              tasks: archiveSummary.tasks.map((t) => ({
                taskId: t.id,
                slug: t.name,
                name: t.name,
                dependsOn: t.depends ?? [],
                description: null,
                agentRole: t.agent ?? null,
                engine: t.engine ?? null,
                provider: engineToProvider(t.engine),
                model: t.model ?? null,
                profile: t.profile ?? null,
                thinking: t.thinking ?? null,
              })),
            },
          },
          source: {
            filePath: archivePlanKey,
            offset: 0,
            snapshotHash: '1',
          },
        });
        archiveEventsCount += 1;
      }

      // Emit events for each archived task
      for (const task of archiveSummary.tasks) {
        const taskOccurredAt =
          task.completedAt ?? archiveSummary.summarizedAt ?? archiveOccurredAt;

        // task_seen
        const archiveTaskSeenKey = `pi-fleet:${project.projectId}:archive:${archiveEntry.id}:task-seen:${task.id}`;
        if (!db.getObservedFile(project.projectId, archiveTaskSeenKey)) {
          db.queueEvent({
            event: {
              schemaVersion: cockpitProtocolSchemaVersion,
              eventId: randomUUID(),
              occurredAt: task.startedAt ?? taskOccurredAt,
              source: 'archive',
              projectId: project.projectId,
              deviceId,
              type: 'task_seen',
              payload: {
                planId: archivePlanId,
                taskId: task.id,
                taskName: task.name,
                slug: task.name,
                dependsOn: task.depends ?? [],
                description: null,
                execution: buildTaskExecution(task),
              },
            },
            source: {
              filePath: archiveTaskSeenKey,
              offset: 0,
              snapshotHash: '1',
            },
          });
          archiveEventsCount += 1;
        }

        // task_started (if startedAt exists)
        if (task.startedAt) {
          const archiveStartedKey = `pi-fleet:${project.projectId}:archive:${archiveEntry.id}:task-started:${task.id}`;
          if (!db.getObservedFile(project.projectId, archiveStartedKey)) {
            db.queueEvent({
              event: {
                schemaVersion: cockpitProtocolSchemaVersion,
                eventId: randomUUID(),
                occurredAt: task.startedAt,
                source: 'archive',
                projectId: project.projectId,
                deviceId,
                type: 'task_started',
                payload: {
                  planId: archivePlanId,
                  taskId: task.id,
                  taskName: task.name,
                  status: 'running',
                  startedAt: task.startedAt,
                  worktreeId: null,
                  execution: buildTaskExecution(task),
                },
              },
              source: {
                filePath: archiveStartedKey,
                offset: 0,
                snapshotHash: '1',
              },
            });
            archiveEventsCount += 1;
          }
        }

        // task_completed or task_failed
        if (task.status === 'done') {
          const archiveCompletedKey = `pi-fleet:${project.projectId}:archive:${archiveEntry.id}:task-completed:${task.id}`;
          if (!db.getObservedFile(project.projectId, archiveCompletedKey)) {
            const usage =
              project.telemetry.usage && task.usage
                ? {
                    inputTokens: task.usage.inputTokens ?? 0,
                    outputTokens: task.usage.outputTokens ?? 0,
                  }
                : undefined;

            db.queueEvent({
              event: {
                schemaVersion: cockpitProtocolSchemaVersion,
                eventId: randomUUID(),
                occurredAt: taskOccurredAt,
                source: 'archive',
                projectId: project.projectId,
                deviceId,
                type: 'task_completed',
                payload: {
                  planId: archivePlanId,
                  taskId: task.id,
                  taskName: task.name,
                  status: 'done',
                  startedAt: task.startedAt ?? null,
                  completedAt: task.completedAt ?? taskOccurredAt,
                  durationMs: task.duration ?? null,
                  retries: task.retries ?? 0,
                  usage,
                },
              },
              source: {
                filePath: archiveCompletedKey,
                offset: 0,
                snapshotHash: '1',
              },
            });
            archiveEventsCount += 1;

            if (project.telemetry.usage && task.usage) {
              const usageKey = `pi-fleet:${project.projectId}:archive:${archiveEntry.id}:usage-reported:${task.id}`;
              if (!db.getObservedFile(project.projectId, usageKey)) {
                db.queueEvent({
                  event: {
                    schemaVersion: cockpitProtocolSchemaVersion,
                    eventId: randomUUID(),
                    occurredAt: taskOccurredAt,
                    source: 'archive',
                    projectId: project.projectId,
                    deviceId,
                    type: 'usage_reported',
                    payload: {
                      planId: archivePlanId,
                      taskId: task.id,
                      status: 'done',
                      usage: {
                        inputTokens: task.usage.inputTokens ?? 0,
                        outputTokens: task.usage.outputTokens ?? 0,
                      },
                    },
                  },
                  source: {
                    filePath: usageKey,
                    offset: 0,
                    snapshotHash: '1',
                  },
                });
                archiveEventsCount += 1;
              }
            }
          }
        } else if (task.status === 'failed') {
          const archiveFailedKey = `pi-fleet:${project.projectId}:archive:${archiveEntry.id}:task-failed:${task.id}`;
          if (!db.getObservedFile(project.projectId, archiveFailedKey)) {
            const usage =
              project.telemetry.usage && task.usage
                ? {
                    inputTokens: task.usage.inputTokens ?? 0,
                    outputTokens: task.usage.outputTokens ?? 0,
                  }
                : undefined;

            db.queueEvent({
              event: {
                schemaVersion: cockpitProtocolSchemaVersion,
                eventId: randomUUID(),
                occurredAt: taskOccurredAt,
                source: 'archive',
                projectId: project.projectId,
                deviceId,
                type: 'task_failed',
                payload: {
                  planId: archivePlanId,
                  taskId: task.id,
                  taskName: task.name,
                  status: 'failed',
                  startedAt: task.startedAt ?? null,
                  completedAt: task.completedAt ?? null,
                  durationMs: task.duration ?? null,
                  retries: task.retries ?? 0,
                  error: task.error ?? 'unknown error',
                  usage,
                },
              },
              source: {
                filePath: archiveFailedKey,
                offset: 0,
                snapshotHash: '1',
              },
            });
            archiveEventsCount += 1;

            if (project.telemetry.usage && task.usage) {
              const usageKey = `pi-fleet:${project.projectId}:archive:${archiveEntry.id}:usage-reported:${task.id}`;
              if (!db.getObservedFile(project.projectId, usageKey)) {
                db.queueEvent({
                  event: {
                    schemaVersion: cockpitProtocolSchemaVersion,
                    eventId: randomUUID(),
                    occurredAt: taskOccurredAt,
                    source: 'archive',
                    projectId: project.projectId,
                    deviceId,
                    type: 'usage_reported',
                    payload: {
                      planId: archivePlanId,
                      taskId: task.id,
                      status: 'failed',
                      usage: {
                        inputTokens: task.usage.inputTokens ?? 0,
                        outputTokens: task.usage.outputTokens ?? 0,
                      },
                    },
                  },
                  source: {
                    filePath: usageKey,
                    offset: 0,
                    snapshotHash: '1',
                  },
                });
                archiveEventsCount += 1;
              }
            }
          }
        }
      }

      // Mark archive as processed
      if (archiveEventsCount > 0) {
        // The archiveSourceKey was already checked above; insert a sentinel to mark it done.
        // We emit a plan_seen for the archive and mark the processing sentinel via the
        // observed_files table by queueing a dummy event that creates the record.
        db.queueEvent({
          event: {
            schemaVersion: cockpitProtocolSchemaVersion,
            eventId: randomUUID(),
            occurredAt: archiveOccurredAt,
            source: 'archive',
            projectId: project.projectId,
            deviceId,
            // Re-emit plan_seen as the processed marker sentinel: the source key
            // "archive:<id>:processed" with snapshotHash "1" marks this archive done.
            type: 'plan_seen',
            payload: {
              planId: archivePlanId,
              title: archiveSummary.plan.title,
              overview: null,
              taskCount: archiveSummary.tasks.length,
              tasks: [],
            },
          },
          source: {
            filePath: archiveSourceKey,
            offset: 0,
            snapshotHash: '1',
          },
        });
      }

      result.queuedArchiveEventCount += archiveEventsCount;
    }
  }

  return result;
};

// ── Progress JSONL tailing ─────────────────────────────────────────────────────

/**
 * Reads new lines from a task's progress.jsonl starting from the stored byte
 * offset. Emits one `task_progressed` event per new line. Returns the count of
 * newly queued events.
 */
const tailProgressJsonl = async (
  db: LocalDaemonDb,
  project: MappedProject,
  deviceId: string,
  planId: string,
  taskId: string,
  taskName: string,
  taskSlug: string,
  taskDir: string,
): Promise<number> => {
  const progressFilePath = path.join(taskDir, 'progress.jsonl');
  const cursorKey = `pi-fleet:${project.projectId}:progress:${taskSlug}`;

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(progressFilePath);
  } catch {
    // File may not exist yet for newly started tasks
    return 0;
  }

  const stored = db.getObservedFile(project.projectId, cursorKey);
  const startOffset = stored?.byteOffset ?? 0;

  // Slice file from the stored offset onwards
  const slice = fileBuffer.subarray(startOffset);
  const text = slice.toString('utf8');

  // Split into lines.  We track position in the original file via currentOffset.
  //
  // CURSOR STRATEGY: we use `offset = lineEndOffset` (exclusive end of line =
  // start of the next byte) as the source cursor stored in observed_files.
  // After each scan, observed_files.byte_offset = end of the last processed line,
  // so the next scan starts exactly at the first unprocessed byte — no line is
  // re-read or re-queued.
  const rawLines = text.split('\n');
  let count = 0;
  let currentOffset = startOffset;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i] ?? '';
    const isLastElement = i === rawLines.length - 1;

    // Bytes consumed: content + '\n' separator, except for the final split element
    // which has no trailing newline (or is empty when the file ends with '\n').
    const contentBytes = Buffer.byteLength(rawLine, 'utf8');
    const lineConsumedBytes = isLastElement ? contentBytes : contentBytes + 1;
    const lineEndOffset = currentOffset + lineConsumedBytes;

    if (rawLine.trim().length === 0) {
      currentOffset = lineEndOffset;
      continue;
    }

    let entry: ProgressEntry | null = null;
    try {
      entry = JSON.parse(rawLine) as ProgressEntry;
    } catch {
      // Skip malformed lines but keep advancing so we don't get stuck.
      currentOffset = lineEndOffset;
      continue;
    }

    if (!entry.ts) {
      currentOffset = lineEndOffset;
      continue;
    }

    const lineHash = hashSnapshot(rawLine);
    const progressStatus =
      entry.status === 'done'
        ? 'done'
        : entry.status === 'error'
          ? 'error'
          : 'running';

    const step = project.telemetry.progressText ? (entry.step ?? null) : null;
    const progressVisible = project.telemetry.progressText && entry.step != null;

    db.queueEvent({
      event: {
        schemaVersion: cockpitProtocolSchemaVersion,
        eventId: randomUUID(),
        occurredAt: entry.ts,
        source: 'live',
        projectId: project.projectId,
        deviceId,
        type: 'task_progressed',
        payload: {
          planId,
          taskId,
          taskName,
          progressStatus,
          step,
          progressVisible,
          progressAt: entry.ts,
          latestProgressAt: entry.ts,
        },
      },
      source: {
        // offset = exclusive end of this line.  observed_files.byte_offset will be
        // updated to MAX(current, lineEndOffset), so the next scan resumes here
        // and does not re-process this line.
        filePath: cursorKey,
        offset: lineEndOffset,
        snapshotHash: lineHash,
      },
    });
    count += 1;
    currentOffset = lineEndOffset;
  }

  return count;
};

// ── Helper utilities ───────────────────────────────────────────────────────────

/**
 * Derives a stable planId slug from a plan title.
 * Example: "Plan: Build the MVP" → "plan-build-the-mvp"
 */
export const deriveActivePlanId = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

/**
 * Maps the pi-fleet `engine` field to a provider identifier used in events.
 */
const engineToProvider = (engine: string | null | undefined): string | null => {
  if (!engine) return null;
  switch (engine.toLowerCase()) {
    case 'claude':
      return 'anthropic';
    case 'codex':
      return 'openai';
    case 'gemini':
      return 'google';
    case 'pi':
      return 'anthropic'; // pi engine uses Claude under the hood
    default:
      return null;
  }
};

/**
 * Reads a JSON file, returning null on ENOENT or parse failure.
 * Does not throw — callers treat null as "file unavailable".
 */
const readJsonFile = async <T>(filePath: string): Promise<T | null> => {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

/**
 * Resolves the directory for a task folder under `.pi/tasks/`.
 * The folder is named `{id}-{slug}` (e.g. "001-audit-...") or just `{slug}`.
 * Falls back to `{id}` if no slug is available.
 */
const resolveTaskDir = (
  piDir: string,
  taskId: string,
  taskSlug: string | null | undefined,
): string | null => {
  if (!taskSlug) return null;
  // Prefer the prefixed form: "001-slug-..."
  if (!taskSlug.startsWith(`${taskId}-`)) {
    return path.join(piDir, 'tasks', `${taskId}-${taskSlug}`);
  }
  return path.join(piDir, 'tasks', taskSlug);
};

interface TaskExecutionFields {
  agent?: string | null;
  engine?: string | null;
  model?: string | null;
  profile?: string | null;
  thinking?: string | null;
}

const buildTaskExecution = (task: TaskExecutionFields) => ({
  agentRole: task.agent ?? null,
  engine: task.engine ?? null,
  provider: engineToProvider(task.engine),
  model: task.model ?? null,
  profile: task.profile ?? null,
  thinking: task.thinking ?? null,
});

const buildPlanTaskSummary = (
  task: PlanSummaryTask,
  includeDescription: boolean,
) => ({
  taskId: task.id,
  slug: task.slug,
  name: task.name,
  dependsOn: task.depends ?? [],
  description: includeDescription ? (task.description ?? null) : null,
  agentRole: task.agent ?? null,
  engine: task.engine ?? null,
  provider: engineToProvider(task.engine),
  model: task.model ?? null,
  profile: task.profile ?? null,
  thinking: task.thinking ?? null,
});
