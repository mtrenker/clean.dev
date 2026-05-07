import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import type { MappedProject } from '@cleandev/cockpit-protocol';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { openLocalDaemonDb, type LocalDaemonDb } from '../local-db';
import { resolveDaemonPaths } from '../config';
import { scanProjectPiFleet, deriveActivePlanId } from './pi-fleet';

// ── Test helpers ───────────────────────────────────────────────────────────────

const tempDirs: string[] = [];

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true });
  }
});

const makeTempRoot = async (): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'pi-fleet-test-'));
  tempDirs.push(root);
  return root;
};

interface TestSetup {
  root: string;
  piDir: string;
  db: LocalDaemonDb;
  project: MappedProject;
  deviceId: string;
}

const createSetup = async (): Promise<TestSetup> => {
  const root = await makeTempRoot();
  const piDir = path.join(root, '.pi');
  await mkdir(path.join(piDir, 'tasks'), { recursive: true });
  await mkdir(path.join(piDir, 'archive'), { recursive: true });

  const paths = resolveDaemonPaths(path.join(root, 'daemon-config.json'));
  const db = await openLocalDaemonDb(paths);

  const project: MappedProject = {
    projectId: 'test-project',
    localRootPath: root,
    telemetry: {
      worktreePath: 'relative',
      repoRootPath: 'off',
      git: 'full',
      progressText: true,
      usage: true,
      planText: true,
      taskDescription: true,
    },
  };

  db.syncConfiguredProjects([project]);

  return { root, piDir, db, project, deviceId: 'test-device' };
};

const writePlanSummary = async (piDir: string, plan: object) =>
  writeFile(
    path.join(piDir, 'tasks', 'plan-summary.json'),
    JSON.stringify(plan, null, 2),
  );

const writeStateJson = async (piDir: string, state: object) =>
  writeFile(path.join(piDir, 'tasks', 'state.json'), JSON.stringify(state, null, 2));

const writeArchiveIndex = async (piDir: string, index: object) =>
  writeFile(
    path.join(piDir, 'archive', 'index.json'),
    JSON.stringify(index, null, 2),
  );

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('deriveActivePlanId', () => {
  it('slugifies a plan title', () => {
    expect(deriveActivePlanId('Plan: Build the MVP')).toBe('plan-build-the-mvp');
  });

  it('handles special characters', () => {
    expect(deriveActivePlanId('Plan: Build clean.dev Cockpit!')).toBe(
      'plan-build-clean-dev-cockpit',
    );
  });

  it('truncates long titles at 80 characters', () => {
    const longTitle = 'A'.repeat(200);
    expect(deriveActivePlanId(longTitle).length).toBeLessThanOrEqual(80);
  });
});

describe('scanProjectPiFleet', () => {
  describe('plan-summary.json → plan_seen + task_seen', () => {
    it('emits plan_seen and task_seen events when plan-summary.json is present', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Test MVP',
        overview: 'A test plan',
        splitAt: '2026-05-01T12:00:00.000Z',
        sourcePlanPath: 'PLAN.md',
        taskCount: 2,
        tasks: [
          {
            id: '001',
            slug: 'first-task',
            name: 'First Task',
            engine: 'claude',
            model: 'sonnet',
            agent: 'worker',
            depends: [],
            description: 'Do the first thing',
          },
          {
            id: '002',
            slug: 'second-task',
            name: 'Second Task',
            engine: 'codex',
            model: 'gpt-5.4',
            agent: 'worker',
            depends: ['001'],
            description: 'Do the second thing',
          },
        ],
      });

      const result = await scanProjectPiFleet(db, project, deviceId);

      expect(result.planId).toBe('plan-test-mvp');
      expect(result.activePlanTitle).toBe('Plan: Test MVP');
      expect(result.queuedPlanSeenCount).toBe(1);
      expect(result.queuedTaskSeenCount).toBe(2);

      const events = db.listPendingOutboundEvents(50);
      const planSeen = events.find((e) => e.event.type === 'plan_seen');
      const taskSeens = events.filter((e) => e.event.type === 'task_seen');

      expect(planSeen).toBeDefined();
      if (planSeen?.event.type === 'plan_seen') {
        expect(planSeen.event.payload.planId).toBe('plan-test-mvp');
        expect(planSeen.event.payload.title).toBe('Plan: Test MVP');
        expect(planSeen.event.payload.overview).toBe('A test plan');
        expect(planSeen.event.payload.taskCount).toBe(2);
        expect(planSeen.event.source).toBe('live');
        expect(planSeen.event.payload.tasks).toHaveLength(2);
        // Engine → provider mapping
        const task1 = planSeen.event.payload.tasks[0];
        expect(task1?.provider).toBe('anthropic');
        const task2 = planSeen.event.payload.tasks[1];
        expect(task2?.provider).toBe('openai');
      }

      expect(taskSeens).toHaveLength(2);
      const task1Seen = taskSeens.find(
        (e) => e.event.type === 'task_seen' && e.event.payload.taskId === '001',
      );
      if (task1Seen?.event.type === 'task_seen') {
        expect(task1Seen.event.payload.taskName).toBe('First Task');
        expect(task1Seen.event.payload.slug).toBe('first-task');
        expect(task1Seen.event.payload.execution.provider).toBe('anthropic');
        expect(task1Seen.event.payload.description).toBe('Do the first thing');
      }
    });

    it('does not re-emit plan_seen when plan-summary.json is unchanged', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const plan = {
        version: 1,
        title: 'Plan: Stable Plan',
        taskCount: 1,
        tasks: [
          { id: '001', name: 'Task One', engine: 'claude', agent: 'worker', depends: [] },
        ],
      };

      await writePlanSummary(piDir, plan);

      const first = await scanProjectPiFleet(db, project, deviceId);
      expect(first.queuedPlanSeenCount).toBe(1);

      const second = await scanProjectPiFleet(db, project, deviceId);
      expect(second.queuedPlanSeenCount).toBe(0);
      expect(second.queuedTaskSeenCount).toBe(0);
    });

    it('re-emits plan_seen when plan-summary.json changes', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: V1',
        taskCount: 1,
        tasks: [{ id: '001', name: 'Task One', engine: 'claude', agent: 'worker', depends: [] }],
      });

      const first = await scanProjectPiFleet(db, project, deviceId);
      expect(first.queuedPlanSeenCount).toBe(1);

      // Simulate plan update (new task added)
      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: V1',
        taskCount: 2,
        tasks: [
          { id: '001', name: 'Task One', engine: 'claude', agent: 'worker', depends: [] },
          { id: '002', name: 'Task Two', engine: 'claude', agent: 'worker', depends: ['001'] },
        ],
      });

      const second = await scanProjectPiFleet(db, project, deviceId);
      expect(second.queuedPlanSeenCount).toBe(1);
      expect(second.queuedTaskSeenCount).toBeGreaterThan(0);
    });

    it('respects planText=false telemetry — omits overview and descriptions', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const restrictedProject: MappedProject = {
        ...project,
        telemetry: { ...project.telemetry, planText: false, taskDescription: false },
      };

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Private Plan',
        overview: 'Sensitive overview',
        taskCount: 1,
        tasks: [
          {
            id: '001',
            name: 'Secret Task',
            engine: 'claude',
            agent: 'worker',
            depends: [],
            description: 'Secret description',
          },
        ],
      });

      await scanProjectPiFleet(db, restrictedProject, deviceId);

      const events = db.listPendingOutboundEvents(50);
      const planSeen = events.find((e) => e.event.type === 'plan_seen');

      if (planSeen?.event.type === 'plan_seen') {
        expect(planSeen.event.payload.overview).toBeNull();
      }

      const taskSeen = events.find((e) => e.event.type === 'task_seen');
      if (taskSeen?.event.type === 'task_seen') {
        expect(taskSeen.event.payload.description).toBeNull();
      }
    });

    it('returns null planId and no events when plan-summary.json is absent', async () => {
      const { db, project, deviceId } = await createSetup();
      // No plan-summary.json written

      const result = await scanProjectPiFleet(db, project, deviceId);

      expect(result.planId).toBeNull();
      expect(result.queuedPlanSeenCount).toBe(0);
    });
  });

  describe('state.json → task lifecycle events', () => {
    it('emits task_started for running tasks', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Active Plan',
        taskCount: 1,
        tasks: [
          { id: '001', name: 'Running Task', slug: 'running-task', engine: 'claude', agent: 'worker', depends: [] },
        ],
      });

      await writeStateJson(piDir, {
        updatedAt: '2026-05-05T20:00:00.000Z',
        tasks: [
          {
            id: '001',
            name: 'running-task',
            agent: 'worker',
            engine: 'claude',
            status: 'running',
            startedAt: '2026-05-05T19:55:00.000Z',
          },
        ],
      });

      const result = await scanProjectPiFleet(db, project, deviceId);

      expect(result.queuedTaskStartedCount).toBe(1);
      expect(result.activeTaskCount).toBe(1);

      const events = db.listPendingOutboundEvents(50);
      const started = events.find((e) => e.event.type === 'task_started');

      expect(started).toBeDefined();
      if (started?.event.type === 'task_started') {
        expect(started.event.payload.taskId).toBe('001');
        expect(started.event.payload.taskName).toBe('Running Task');
        expect(started.event.payload.status).toBe('running');
        expect(started.event.payload.startedAt).toBe('2026-05-05T19:55:00.000Z');
        expect(started.event.payload.execution.engine).toBe('claude');
        expect(started.event.payload.execution.provider).toBe('anthropic');
      }
    });

    it('does not re-emit task_started on second scan', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Active Plan',
        taskCount: 1,
        tasks: [{ id: '001', name: 'Task', slug: 'task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [
          { id: '001', name: 'task', status: 'running', startedAt: '2026-05-05T19:55:00.000Z' },
        ],
      });

      const first = await scanProjectPiFleet(db, project, deviceId);
      expect(first.queuedTaskStartedCount).toBe(1);

      const second = await scanProjectPiFleet(db, project, deviceId);
      expect(second.queuedTaskStartedCount).toBe(0);
    });

    it('emits task_completed and usage_reported for done tasks', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Done Plan',
        taskCount: 1,
        tasks: [{ id: '001', name: 'Done Task', slug: 'done-task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [
          {
            id: '001',
            name: 'done-task',
            status: 'done',
            startedAt: '2026-05-05T19:00:00.000Z',
            completedAt: '2026-05-05T19:30:00.000Z',
          },
        ],
      });

      // Write status.json for the completed task
      const taskDir = path.join(piDir, 'tasks', '001-done-task');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'done-task',
          engine: 'claude',
          agent: 'worker',
          status: 'done',
          startedAt: '2026-05-05T19:00:00.000Z',
          completedAt: '2026-05-05T19:30:00.000Z',
          duration: 1800000,
          retries: 0,
          error: null,
          usage: { inputTokens: 1000, outputTokens: 500 },
        }),
      );

      const result = await scanProjectPiFleet(db, project, deviceId);

      expect(result.queuedTaskCompletedCount).toBe(1);
      expect(result.queuedUsageReportedCount).toBe(1);

      const events = db.listPendingOutboundEvents(50);
      const completed = events.find((e) => e.event.type === 'task_completed');
      const usageReported = events.find((e) => e.event.type === 'usage_reported');

      expect(completed).toBeDefined();
      if (completed?.event.type === 'task_completed') {
        expect(completed.event.payload.taskId).toBe('001');
        expect(completed.event.payload.taskName).toBe('Done Task');
        expect(completed.event.payload.status).toBe('done');
        expect(completed.event.payload.durationMs).toBe(1800000);
        expect(completed.event.payload.retries).toBe(0);
        expect(completed.event.payload.usage?.inputTokens).toBe(1000);
        expect(completed.event.payload.usage?.outputTokens).toBe(500);
      }

      expect(usageReported).toBeDefined();
      if (usageReported?.event.type === 'usage_reported') {
        expect(usageReported.event.payload.taskId).toBe('001');
        expect(usageReported.event.payload.usage.inputTokens).toBe(1000);
      }
    });

    it('emits task_failed for failed tasks', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Failed Plan',
        taskCount: 1,
        tasks: [{ id: '001', name: 'Failed Task', slug: 'failed-task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [
          {
            id: '001',
            name: 'failed-task',
            status: 'failed',
            startedAt: '2026-05-05T19:00:00.000Z',
            completedAt: '2026-05-05T19:10:00.000Z',
          },
        ],
      });

      const taskDir = path.join(piDir, 'tasks', '001-failed-task');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'failed-task',
          engine: 'claude',
          status: 'failed',
          startedAt: '2026-05-05T19:00:00.000Z',
          completedAt: '2026-05-05T19:10:00.000Z',
          duration: 600000,
          retries: 0,
          error: 'Build failed with exit code 1',
          usage: { inputTokens: 200, outputTokens: 50 },
        }),
      );

      const result = await scanProjectPiFleet(db, project, deviceId);

      expect(result.queuedTaskFailedCount).toBe(1);

      const events = db.listPendingOutboundEvents(50);
      const failed = events.find((e) => e.event.type === 'task_failed');

      expect(failed).toBeDefined();
      if (failed?.event.type === 'task_failed') {
        expect(failed.event.payload.taskId).toBe('001');
        expect(failed.event.payload.status).toBe('failed');
        expect(failed.event.payload.error).toBe('Build failed with exit code 1');
        expect(failed.event.payload.durationMs).toBe(600000);
      }
    });

    it('omits usage when telemetry.usage=false', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const noUsageProject: MappedProject = {
        ...project,
        telemetry: { ...project.telemetry, usage: false },
      };

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: No Usage',
        taskCount: 1,
        tasks: [{ id: '001', name: 'Task', slug: 'task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'task', status: 'done', completedAt: '2026-05-05T20:00:00.000Z' }],
      });

      const taskDir = path.join(piDir, 'tasks', '001-task');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'task',
          status: 'done',
          completedAt: '2026-05-05T20:00:00.000Z',
          retries: 0,
          error: null,
          usage: { inputTokens: 999, outputTokens: 888 },
        }),
      );

      await scanProjectPiFleet(db, noUsageProject, deviceId);

      const events = db.listPendingOutboundEvents(50);
      const completed = events.find((e) => e.event.type === 'task_completed');
      const usageReported = events.find((e) => e.event.type === 'usage_reported');

      if (completed?.event.type === 'task_completed') {
        expect(completed.event.payload.usage).toBeUndefined();
      }
      expect(usageReported).toBeUndefined();
    });
  });

  describe('progress.jsonl tailing', () => {
    it('emits task_progressed events for new progress lines', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Progress Plan',
        taskCount: 1,
        tasks: [{ id: '001', name: 'Running Task', slug: 'running-task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [
          {
            id: '001',
            name: 'running-task',
            status: 'running',
            startedAt: '2026-05-05T20:00:00.000Z',
            latestProgressAt: '2026-05-05T20:01:00.000Z',
          },
        ],
      });

      const taskDir = path.join(piDir, 'tasks', '001-running-task');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'progress.jsonl'),
        [
          JSON.stringify({ ts: '2026-05-05T20:00:30.000Z', step: 'Step one', status: 'running' }),
          JSON.stringify({ ts: '2026-05-05T20:01:00.000Z', step: 'Step two', status: 'running' }),
        ].join('\n') + '\n',
      );

      const result = await scanProjectPiFleet(db, project, deviceId);

      expect(result.queuedTaskProgressedCount).toBe(2);

      const events = db.listPendingOutboundEvents(50);
      const progressed = events.filter((e) => e.event.type === 'task_progressed');
      expect(progressed).toHaveLength(2);

      if (progressed[0]?.event.type === 'task_progressed') {
        expect(progressed[0].event.payload.step).toBe('Step one');
        expect(progressed[0].event.payload.progressVisible).toBe(true);
        expect(progressed[0].event.payload.progressStatus).toBe('running');
      }
    });

    it('does not re-emit progress lines on second scan', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Progress Stable',
        taskCount: 1,
        tasks: [{ id: '001', name: 'Stable Task', slug: 'stable-task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [
          { id: '001', name: 'stable-task', status: 'running', startedAt: '2026-05-05T20:00:00.000Z' },
        ],
      });

      const taskDir = path.join(piDir, 'tasks', '001-stable-task');
      await mkdir(taskDir, { recursive: true });
      const progressLine = JSON.stringify({ ts: '2026-05-05T20:00:30.000Z', step: 'Step A', status: 'running' });
      await writeFile(path.join(taskDir, 'progress.jsonl'), progressLine + '\n');

      const first = await scanProjectPiFleet(db, project, deviceId);
      expect(first.queuedTaskProgressedCount).toBe(1);

      const second = await scanProjectPiFleet(db, project, deviceId);
      // The cursor points to the end of the only line; the slice is empty, so no new events.
      expect(second.queuedTaskProgressedCount).toBe(0);
    });

    it('tails new progress lines after initial scan', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Growing',
        taskCount: 1,
        tasks: [{ id: '001', name: 'Growing Task', slug: 'growing-task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      const stateData = {
        tasks: [
          { id: '001', name: 'growing-task', status: 'running', startedAt: '2026-05-05T20:00:00.000Z' },
        ],
      };
      await writeStateJson(piDir, stateData);

      const taskDir = path.join(piDir, 'tasks', '001-growing-task');
      await mkdir(taskDir, { recursive: true });
      const line1 = JSON.stringify({ ts: '2026-05-05T20:00:30.000Z', step: 'First step', status: 'running' });
      await writeFile(path.join(taskDir, 'progress.jsonl'), line1 + '\n');

      const first = await scanProjectPiFleet(db, project, deviceId);
      expect(first.queuedTaskProgressedCount).toBe(1);

      // Append a new line
      const line2 = JSON.stringify({ ts: '2026-05-05T20:01:00.000Z', step: 'Second step', status: 'running' });
      const existingContent = line1 + '\n' + line2 + '\n';
      await writeFile(path.join(taskDir, 'progress.jsonl'), existingContent);

      const second = await scanProjectPiFleet(db, project, deviceId);
      expect(second.queuedTaskProgressedCount).toBe(1); // Only the new line
    });

    it('omits step text when progressText=false', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const noProgressTextProject: MappedProject = {
        ...project,
        telemetry: { ...project.telemetry, progressText: false },
      };

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Silent Progress',
        taskCount: 1,
        tasks: [{ id: '001', name: 'Task', slug: 'task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'task', status: 'running', startedAt: '2026-05-05T20:00:00.000Z' }],
      });

      const taskDir = path.join(piDir, 'tasks', '001-task');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'progress.jsonl'),
        JSON.stringify({ ts: '2026-05-05T20:00:30.000Z', step: 'Secret step', status: 'running' }) + '\n',
      );

      await scanProjectPiFleet(db, noProgressTextProject, deviceId);

      const events = db.listPendingOutboundEvents(50);
      const progressed = events.find((e) => e.event.type === 'task_progressed');

      if (progressed?.event.type === 'task_progressed') {
        expect(progressed.event.payload.step).toBeNull();
        expect(progressed.event.payload.progressVisible).toBe(false);
      }
    });
  });

  describe('archive/index.json → historical events', () => {
    it('emits archive events for each archived plan and task', async () => {
      const { root, piDir, db, project, deviceId } = await createSetup();

      const archiveId = '2026-04-01T10-00-00-000Z-plan-old-plan';
      const archiveDir = path.join(piDir, 'archive', archiveId);
      await mkdir(archiveDir, { recursive: true });

      await writeArchiveIndex(piDir, {
        version: 1,
        archives: [
          {
            id: archiveId,
            archivedAt: '2026-04-01T10:00:00.000Z',
            reason: 'manual',
            title: 'Plan: Old Plan',
            taskCount: 2,
            archivePath: `.pi/archive/${archiveId}`,
          },
        ],
      });

      await writeFile(
        path.join(archiveDir, 'archive-summary.json'),
        JSON.stringify({
          version: 1,
          summarizedAt: '2026-04-01T10:00:00.000Z',
          plan: {
            title: 'Plan: Old Plan',
            overview: 'Historical plan',
            splitAt: '2026-04-01T08:00:00.000Z',
            taskCount: 2,
          },
          tasks: [
            {
              id: '001',
              name: 'first-historical-task',
              agent: 'scout',
              engine: 'claude',
              model: 'sonnet',
              profile: 'deep',
              thinking: 'high',
              status: 'done',
              depends: [],
              retries: 0,
              startedAt: '2026-04-01T08:01:00.000Z',
              completedAt: '2026-04-01T08:15:00.000Z',
              duration: 840000,
              error: null,
              progressEntries: 10,
              usage: { inputTokens: 5000, outputTokens: 2000 },
            },
            {
              id: '002',
              name: 'second-historical-task',
              agent: 'worker',
              engine: 'codex',
              model: 'gpt-5.4',
              status: 'done',
              depends: ['001'],
              retries: 0,
              startedAt: '2026-04-01T08:15:00.000Z',
              completedAt: '2026-04-01T09:00:00.000Z',
              duration: 2700000,
              error: null,
              progressEntries: 5,
              usage: { inputTokens: 3000, outputTokens: 1000 },
            },
          ],
        }),
      );

      const result = await scanProjectPiFleet(db, project, deviceId);

      expect(result.queuedArchiveEventCount).toBeGreaterThan(0);

      const events = db.listPendingOutboundEvents(100);
      const archiveEvents = events.filter((e) => e.event.source === 'archive');

      expect(archiveEvents.length).toBeGreaterThan(0);

      const archivePlanSeen = archiveEvents.find(
        (e) => e.event.type === 'plan_seen' && e.event.payload.planId === archiveId,
      );
      expect(archivePlanSeen).toBeDefined();

      const archiveTaskCompleteds = archiveEvents.filter(
        (e) => e.event.type === 'task_completed',
      );
      expect(archiveTaskCompleteds).toHaveLength(2);

      // Check provider mapping in archive events
      const task1 = archiveEvents.find(
        (e) => e.event.type === 'task_started' && e.event.payload.taskId === '001',
      );
      if (task1?.event.type === 'task_started') {
        expect(task1.event.payload.execution.provider).toBe('anthropic');
      }

      const task2Started = archiveEvents.find(
        (e) => e.event.type === 'task_started' && e.event.payload.taskId === '002',
      );
      if (task2Started?.event.type === 'task_started') {
        expect(task2Started.event.payload.execution.provider).toBe('openai');
      }
    });

    it('does not re-process already-processed archives on second scan', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const archiveId = '2026-04-01T10-00-00-000Z-plan-once';
      const archiveDir = path.join(piDir, 'archive', archiveId);
      await mkdir(archiveDir, { recursive: true });

      await writeArchiveIndex(piDir, {
        version: 1,
        archives: [
          {
            id: archiveId,
            archivedAt: '2026-04-01T10:00:00.000Z',
            title: 'Plan: Once',
            taskCount: 1,
            archivePath: `.pi/archive/${archiveId}`,
          },
        ],
      });

      await writeFile(
        path.join(archiveDir, 'archive-summary.json'),
        JSON.stringify({
          plan: { title: 'Plan: Once', taskCount: 1 },
          tasks: [
            {
              id: '001',
              name: 'task',
              engine: 'claude',
              status: 'done',
              depends: [],
              retries: 0,
              startedAt: '2026-04-01T08:00:00.000Z',
              completedAt: '2026-04-01T09:00:00.000Z',
              usage: { inputTokens: 100, outputTokens: 50 },
            },
          ],
        }),
      );

      const first = await scanProjectPiFleet(db, project, deviceId);
      expect(first.queuedArchiveEventCount).toBeGreaterThan(0);

      const second = await scanProjectPiFleet(db, project, deviceId);
      expect(second.queuedArchiveEventCount).toBe(0);
    });

    it('gracefully skips archives with missing archive-summary.json', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      await writeArchiveIndex(piDir, {
        version: 1,
        archives: [
          {
            id: '2026-04-01T10-00-00-000Z-plan-missing',
            archivedAt: '2026-04-01T10:00:00.000Z',
            title: 'Plan: Missing',
            archivePath: `.pi/archive/2026-04-01T10-00-00-000Z-plan-missing`,
          },
        ],
      });
      // No archive directory or archive-summary.json created

      const result = await scanProjectPiFleet(db, project, deviceId);
      expect(result.queuedArchiveEventCount).toBe(0);
    });

    it('returns no archive events when archive/index.json is absent', async () => {
      const { db, project, deviceId } = await createSetup();
      // No archive/index.json

      const result = await scanProjectPiFleet(db, project, deviceId);
      expect(result.queuedArchiveEventCount).toBe(0);
    });
  });

  describe('stable replay of real repo archive data', () => {
    it('produces stable event counts when replaying the real .pi/archive data twice', async () => {
      // This test uses the actual .pi directory of this repo as input.
      // It verifies idempotency: the first scan produces events; the second produces none.
      const repoRoot = process.cwd();
      const piIndexPath = `${repoRoot}/.pi/archive/index.json`;

      let hasArchive = false;
      try {
        await readFile(piIndexPath);
        hasArchive = true;
      } catch {
        // No archive in this repo — skip
      }

      if (!hasArchive) {
        // Skip silently if no archive
        return;
      }

      const root = await makeTempRoot();
      const paths = resolveDaemonPaths(path.join(root, 'daemon-config.json'));
      const db = await openLocalDaemonDb(paths);

      const project: MappedProject = {
        projectId: 'real-repo-test',
        localRootPath: repoRoot,
        telemetry: {
          worktreePath: 'off',
          repoRootPath: 'off',
          git: 'off',
          progressText: false,
          usage: true,
          planText: true,
          taskDescription: true,
        },
      };

      db.syncConfiguredProjects([project]);

      const first = await scanProjectPiFleet(db, project, 'test-device');
      const firstTotal =
        first.queuedPlanSeenCount +
        first.queuedTaskSeenCount +
        first.queuedTaskStartedCount +
        first.queuedTaskCompletedCount +
        first.queuedTaskFailedCount +
        first.queuedUsageReportedCount +
        first.queuedArchiveEventCount;

      expect(firstTotal).toBeGreaterThan(0);

      // Second scan: everything should be idempotent
      const second = await scanProjectPiFleet(db, project, 'test-device');
      const secondTotal =
        second.queuedPlanSeenCount +
        second.queuedTaskSeenCount +
        second.queuedTaskStartedCount +
        second.queuedTaskCompletedCount +
        second.queuedTaskFailedCount +
        second.queuedUsageReportedCount +
        second.queuedArchiveEventCount;

      expect(secondTotal).toBe(0);

      db.close();
    });
  });
});
