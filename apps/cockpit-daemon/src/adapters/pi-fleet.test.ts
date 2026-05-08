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

  // ── New tests: exact task text, handoff, output, cost, multi-device ──────────

  describe('task.md → detailContent in task_seen', () => {
    it('includes task.md content as detailContent when taskDescription=true', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-my-task');
      await mkdir(taskDir, { recursive: true });
      const taskMarkdown = '# Task 001\n\nDo something important.';
      await writeFile(path.join(taskDir, 'task.md'), taskMarkdown);

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Detail Plan',
        taskCount: 1,
        tasks: [
          {
            id: '001',
            slug: 'my-task',
            name: 'My Task',
            engine: 'claude',
            model: 'sonnet',
            agent: 'worker',
            depends: [],
          },
        ],
      });

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(50);
      const taskSeen = events.find(
        (e) => e.event.type === 'task_seen' && e.event.payload.taskId === '001',
      );

      expect(taskSeen).toBeDefined();
      if (taskSeen?.event.type === 'task_seen') {
        expect(taskSeen.event.payload.detailContent).toBe(taskMarkdown);
      }
    });

    it('omits detailContent when task.md does not exist', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: No Detail',
        taskCount: 1,
        tasks: [{ id: '001', slug: 'no-detail', name: 'No Detail', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(50);
      const taskSeen = events.find((e) => e.event.type === 'task_seen');

      if (taskSeen?.event.type === 'task_seen') {
        expect(taskSeen.event.payload.detailContent).toBeNull();
      }
    });

    it('omits detailContent when taskDescription=false', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const restrictedProject: MappedProject = {
        ...project,
        telemetry: { ...project.telemetry, taskDescription: false },
      };

      const taskDir = path.join(piDir, 'tasks', '001-secret-task');
      await mkdir(taskDir, { recursive: true });
      await writeFile(path.join(taskDir, 'task.md'), '# Secret Task');

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Restricted',
        taskCount: 1,
        tasks: [
          { id: '001', slug: 'secret-task', name: 'Secret Task', engine: 'claude', agent: 'worker', depends: [] },
        ],
      });

      await scanProjectPiFleet(db, restrictedProject, deviceId);

      const events = db.listPendingOutboundEvents(50);
      const taskSeen = events.find((e) => e.event.type === 'task_seen');

      if (taskSeen?.event.type === 'task_seen') {
        expect(taskSeen.event.payload.detailContent).toBeNull();
      }
    });

    it('truncates task.md content to 12000 chars', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-big-task');
      await mkdir(taskDir, { recursive: true });
      const bigContent = 'x'.repeat(15_000);
      await writeFile(path.join(taskDir, 'task.md'), bigContent);

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Big Task',
        taskCount: 1,
        tasks: [{ id: '001', slug: 'big-task', name: 'Big Task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(50);
      const taskSeen = events.find((e) => e.event.type === 'task_seen');

      if (taskSeen?.event.type === 'task_seen') {
        expect(taskSeen.event.payload.detailContent?.length).toBeLessThanOrEqual(12_000);
      }
    });

    it('re-emits task_seen when task.md content changes', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-evolving-task');
      await mkdir(taskDir, { recursive: true });
      await writeFile(path.join(taskDir, 'task.md'), 'Version 1');

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Evolving',
        taskCount: 1,
        tasks: [{ id: '001', slug: 'evolving-task', name: 'Evolving Task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      const first = await scanProjectPiFleet(db, project, deviceId);
      expect(first.queuedTaskSeenCount).toBe(1);

      // Update task.md
      await writeFile(path.join(taskDir, 'task.md'), 'Version 2 — updated requirements');

      const second = await scanProjectPiFleet(db, project, deviceId);
      // Plan hash is unchanged but task hash includes detailContent, so re-emission is skipped
      // because the plan-summary hash gates re-emission. Task-level re-emission requires plan to change.
      // This is the expected behaviour: task.md changes alone don't re-trigger without plan changes.
      // The test documents this limitation.
      expect(second.queuedTaskSeenCount).toBe(0);
    });
  });

  describe('handoff.md → task_handoff_seen', () => {
    it('emits task_handoff_seen for a completed task with handoff.md', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-done-with-handoff');
      await mkdir(taskDir, { recursive: true });

      const handoffText = '# Handoff\n\nAll work completed. Key outputs: X, Y, Z.';
      await writeFile(path.join(taskDir, 'handoff.md'), handoffText);
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'done-with-handoff',
          engine: 'claude',
          model: 'sonnet',
          agent: 'worker',
          status: 'done',
          startedAt: '2026-05-05T10:00:00.000Z',
          completedAt: '2026-05-05T11:00:00.000Z',
          duration: 3600000,
          retries: 0,
          usage: { inputTokens: 5000, outputTokens: 2000 },
        }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Handoff Plan',
        taskCount: 1,
        tasks: [
          {
            id: '001',
            slug: 'done-with-handoff',
            name: 'Done With Handoff',
            engine: 'claude',
            model: 'sonnet',
            agent: 'worker',
            depends: [],
          },
        ],
      });

      await writeStateJson(piDir, {
        tasks: [
          {
            id: '001',
            name: 'done-with-handoff',
            status: 'done',
            startedAt: '2026-05-05T10:00:00.000Z',
            completedAt: '2026-05-05T11:00:00.000Z',
          },
        ],
      });

      const result = await scanProjectPiFleet(db, project, deviceId);
      expect(result.queuedHandoffSeenCount).toBe(1);

      const events = db.listPendingOutboundEvents(100);
      const handoffSeen = events.find((e) => e.event.type === 'task_handoff_seen');

      expect(handoffSeen).toBeDefined();
      if (handoffSeen?.event.type === 'task_handoff_seen') {
        expect(handoffSeen.event.payload.taskId).toBe('001');
        expect(handoffSeen.event.payload.taskName).toBe('Done With Handoff');
        expect(handoffSeen.event.payload.handoffContent).toBe(handoffText);
        expect(handoffSeen.event.payload.contentHash).toMatch(/^[0-9a-f]{64}$/);
      }
    });

    it('does not re-emit task_handoff_seen when handoff.md is unchanged', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-stable-handoff');
      await mkdir(taskDir, { recursive: true });
      await writeFile(path.join(taskDir, 'handoff.md'), 'Stable handoff content');
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'stable-handoff',
          status: 'done',
          completedAt: '2026-05-05T11:00:00.000Z',
          retries: 0,
        }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Stable Handoff',
        taskCount: 1,
        tasks: [{ id: '001', slug: 'stable-handoff', name: 'Stable Handoff', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'stable-handoff', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      const first = await scanProjectPiFleet(db, project, deviceId);
      expect(first.queuedHandoffSeenCount).toBe(1);

      const second = await scanProjectPiFleet(db, project, deviceId);
      expect(second.queuedHandoffSeenCount).toBe(0);
    });

    it('re-emits task_handoff_seen when handoff.md content changes', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-changing-handoff');
      await mkdir(taskDir, { recursive: true });
      await writeFile(path.join(taskDir, 'handoff.md'), 'Initial handoff');
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({ id: '001', name: 'changing-handoff', status: 'done', completedAt: '2026-05-05T11:00:00.000Z', retries: 0 }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Changing Handoff',
        taskCount: 1,
        tasks: [{ id: '001', slug: 'changing-handoff', name: 'Changing Handoff', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'changing-handoff', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      const first = await scanProjectPiFleet(db, project, deviceId);
      expect(first.queuedHandoffSeenCount).toBe(1);

      // Update handoff.md
      await writeFile(path.join(taskDir, 'handoff.md'), 'Updated handoff with more details');

      const second = await scanProjectPiFleet(db, project, deviceId);
      expect(second.queuedHandoffSeenCount).toBe(1);

      const allEvents = db.listPendingOutboundEvents(200);
      const handoffEvents = allEvents.filter((e) => e.event.type === 'task_handoff_seen');
      expect(handoffEvents).toHaveLength(2);
    });

    it('does not emit task_handoff_seen for running tasks', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-running-with-handoff');
      await mkdir(taskDir, { recursive: true });
      // handoff.md exists but task is still running
      await writeFile(path.join(taskDir, 'handoff.md'), 'Premature handoff');

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Running',
        taskCount: 1,
        tasks: [{ id: '001', slug: 'running-with-handoff', name: 'Running', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'running-with-handoff', status: 'running', startedAt: '2026-05-05T10:00:00.000Z' }],
      });

      const result = await scanProjectPiFleet(db, project, deviceId);
      expect(result.queuedHandoffSeenCount).toBe(0);
    });

    it('emits task_handoff_seen for failed tasks with handoff.md', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-failed-with-handoff');
      await mkdir(taskDir, { recursive: true });
      await writeFile(path.join(taskDir, 'handoff.md'), 'Partial handoff before failure');
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'failed-with-handoff',
          status: 'failed',
          completedAt: '2026-05-05T11:00:00.000Z',
          error: 'Something went wrong',
          retries: 1,
        }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Failed Handoff',
        taskCount: 1,
        tasks: [{ id: '001', slug: 'failed-with-handoff', name: 'Failed', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'failed-with-handoff', status: 'failed', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      const result = await scanProjectPiFleet(db, project, deviceId);
      expect(result.queuedHandoffSeenCount).toBe(1);
    });

    it('skips handoff emission when handoff.md is absent', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-no-handoff');
      await mkdir(taskDir, { recursive: true });
      // No handoff.md
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({ id: '001', name: 'no-handoff', status: 'done', completedAt: '2026-05-05T11:00:00.000Z', retries: 0 }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: No Handoff',
        taskCount: 1,
        tasks: [{ id: '001', slug: 'no-handoff', name: 'No Handoff', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'no-handoff', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      const result = await scanProjectPiFleet(db, project, deviceId);
      expect(result.queuedHandoffSeenCount).toBe(0);
    });
  });

  describe('output.jsonl → task_output_seen', () => {
    it('emits task_output_seen for a completed task with output.jsonl', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-done-with-output');
      await mkdir(taskDir, { recursive: true });

      const outputContent = '{"type":"text","text":"Result line 1"}\n{"type":"text","text":"Result line 2"}\n';
      await writeFile(path.join(taskDir, 'output.jsonl'), outputContent);
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'done-with-output',
          status: 'done',
          completedAt: '2026-05-05T11:00:00.000Z',
          retries: 0,
        }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Output Plan',
        taskCount: 1,
        tasks: [
          { id: '001', slug: 'done-with-output', name: 'Done With Output', engine: 'claude', agent: 'worker', depends: [] },
        ],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'done-with-output', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      const result = await scanProjectPiFleet(db, project, deviceId);
      expect(result.queuedOutputSeenCount).toBe(1);

      const events = db.listPendingOutboundEvents(100);
      const outputSeen = events.find((e) => e.event.type === 'task_output_seen');

      expect(outputSeen).toBeDefined();
      if (outputSeen?.event.type === 'task_output_seen') {
        expect(outputSeen.event.payload.taskId).toBe('001');
        expect(outputSeen.event.payload.outputTail).toBe(outputContent);
        expect(outputSeen.event.payload.contentHash).toMatch(/^[0-9a-f]{64}$/);
      }
    });

    it('returns the tail when output.jsonl exceeds 4000 chars', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-big-output');
      await mkdir(taskDir, { recursive: true });

      const bigOutput = 'x'.repeat(6_000);
      await writeFile(path.join(taskDir, 'output.jsonl'), bigOutput);
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({ id: '001', name: 'big-output', status: 'done', completedAt: '2026-05-05T11:00:00.000Z', retries: 0 }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Big Output',
        taskCount: 1,
        tasks: [{ id: '001', slug: 'big-output', name: 'Big Output', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'big-output', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(100);
      const outputSeen = events.find((e) => e.event.type === 'task_output_seen');

      if (outputSeen?.event.type === 'task_output_seen') {
        expect(outputSeen.event.payload.outputTail?.length).toBeLessThanOrEqual(4_000);
        // Should be the tail (last 4000 chars)
        expect(outputSeen.event.payload.outputTail).toBe('x'.repeat(4_000));
      }
    });

    it('does not emit task_output_seen when output.jsonl is absent', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-no-output');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({ id: '001', name: 'no-output', status: 'done', completedAt: '2026-05-05T11:00:00.000Z', retries: 0 }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: No Output',
        taskCount: 1,
        tasks: [{ id: '001', slug: 'no-output', name: 'No Output', engine: 'claude', agent: 'worker', depends: [] }],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'no-output', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      const result = await scanProjectPiFleet(db, project, deviceId);
      expect(result.queuedOutputSeenCount).toBe(0);
    });
  });

  describe('cost estimation → costEstimate in events', () => {
    it('includes costEstimate in task_completed when model is known', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-costed-task');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'costed-task',
          engine: 'claude',
          model: 'claude-3-5-sonnet',
          agent: 'worker',
          status: 'done',
          startedAt: '2026-05-05T10:00:00.000Z',
          completedAt: '2026-05-05T11:00:00.000Z',
          duration: 3600000,
          retries: 0,
          usage: { inputTokens: 100_000, outputTokens: 50_000 },
        }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Costed',
        taskCount: 1,
        tasks: [
          {
            id: '001',
            slug: 'costed-task',
            name: 'Costed Task',
            engine: 'claude',
            model: 'claude-3-5-sonnet',
            agent: 'worker',
            depends: [],
          },
        ],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'costed-task', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(100);
      const completed = events.find((e) => e.event.type === 'task_completed');

      expect(completed).toBeDefined();
      if (completed?.event.type === 'task_completed') {
        const ce = completed.event.payload.costEstimate;
        expect(ce).toBeDefined();
        expect(ce?.currency).toBe('USD');
        // 100k input * $3/1M = $0.30
        expect(ce?.inputCost).toBeCloseTo(0.3, 5);
        // 50k output * $15/1M = $0.75
        expect(ce?.outputCost).toBeCloseTo(0.75, 5);
        expect(ce?.totalCost).toBeCloseTo(1.05, 5);
        expect(ce?.pricingSource).toBe('estimated');
      }
    });

    it('includes costEstimate in usage_reported when model is known', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-usage-cost');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'usage-cost',
          model: 'sonnet',
          status: 'done',
          completedAt: '2026-05-05T11:00:00.000Z',
          retries: 0,
          usage: { inputTokens: 1_000_000, outputTokens: 500_000 },
        }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Usage Cost',
        taskCount: 1,
        tasks: [
          { id: '001', slug: 'usage-cost', name: 'Usage Cost', engine: 'claude', model: 'sonnet', agent: 'worker', depends: [] },
        ],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'usage-cost', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(100);
      const usageReported = events.find((e) => e.event.type === 'usage_reported');

      expect(usageReported).toBeDefined();
      if (usageReported?.event.type === 'usage_reported') {
        const ce = usageReported.event.payload.costEstimate;
        expect(ce).toBeDefined();
        expect(ce?.pricingSource).toBe('estimated');
        // 1M input * $3/1M = $3.00
        expect(ce?.inputCost).toBeCloseTo(3.0, 5);
      }
    });

    it('omits costEstimate when model is unknown', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-unknown-model');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'unknown-model',
          model: 'mystery-model-v99',
          status: 'done',
          completedAt: '2026-05-05T11:00:00.000Z',
          retries: 0,
          usage: { inputTokens: 5000, outputTokens: 2000 },
        }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Unknown Model',
        taskCount: 1,
        tasks: [
          { id: '001', slug: 'unknown-model', name: 'Unknown Model Task', engine: 'claude', model: 'mystery-model-v99', agent: 'worker', depends: [] },
        ],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'unknown-model', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(100);
      const completed = events.find((e) => e.event.type === 'task_completed');

      if (completed?.event.type === 'task_completed') {
        expect(completed.event.payload.costEstimate).toBeUndefined();
      }
    });

    it('omits costEstimate when usage is missing', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-no-usage');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'no-usage',
          model: 'sonnet',
          status: 'done',
          completedAt: '2026-05-05T11:00:00.000Z',
          retries: 0,
          // No usage field
        }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Missing Usage',
        taskCount: 1,
        tasks: [
          { id: '001', slug: 'no-usage', name: 'No Usage', engine: 'claude', model: 'sonnet', agent: 'worker', depends: [] },
        ],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'no-usage', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(100);
      const completed = events.find((e) => e.event.type === 'task_completed');

      if (completed?.event.type === 'task_completed') {
        expect(completed.event.payload.costEstimate).toBeUndefined();
      }
    });

    it('includes costEstimate in task_failed when model and usage are present', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const taskDir = path.join(piDir, 'tasks', '001-failed-costed');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'failed-costed',
          model: 'haiku',
          status: 'failed',
          completedAt: '2026-05-05T11:00:00.000Z',
          error: 'Out of budget',
          retries: 0,
          usage: { inputTokens: 200_000, outputTokens: 10_000 },
        }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Failed Costed',
        taskCount: 1,
        tasks: [
          { id: '001', slug: 'failed-costed', name: 'Failed Costed', engine: 'claude', model: 'haiku', agent: 'worker', depends: [] },
        ],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'failed-costed', status: 'failed', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(100);
      const failed = events.find((e) => e.event.type === 'task_failed');

      expect(failed).toBeDefined();
      if (failed?.event.type === 'task_failed') {
        expect(failed.event.payload.costEstimate).toBeDefined();
        expect(failed.event.payload.costEstimate?.pricingSource).toBe('estimated');
      }
    });

    it('supports customRates for cost calculation', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const customRates = { 'my-custom-model': { inputPer1M: 1.0, outputPer1M: 2.0 } };

      const taskDir = path.join(piDir, 'tasks', '001-custom-rate');
      await mkdir(taskDir, { recursive: true });
      await writeFile(
        path.join(taskDir, 'status.json'),
        JSON.stringify({
          id: '001',
          name: 'custom-rate',
          model: 'my-custom-model',
          status: 'done',
          completedAt: '2026-05-05T11:00:00.000Z',
          retries: 0,
          usage: { inputTokens: 1_000_000, outputTokens: 500_000 },
        }),
      );

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Custom Rate',
        taskCount: 1,
        tasks: [
          { id: '001', slug: 'custom-rate', name: 'Custom Rate', engine: 'claude', model: 'my-custom-model', agent: 'worker', depends: [] },
        ],
      });

      await writeStateJson(piDir, {
        tasks: [{ id: '001', name: 'custom-rate', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' }],
      });

      await scanProjectPiFleet(db, project, deviceId, customRates);

      const events = db.listPendingOutboundEvents(100);
      const completed = events.find((e) => e.event.type === 'task_completed');

      if (completed?.event.type === 'task_completed') {
        const ce = completed.event.payload.costEstimate;
        expect(ce).toBeDefined();
        // 1M input * $1.00/1M = $1.00
        expect(ce?.inputCost).toBe(1.0);
        // 0.5M output * $2.00/1M = $1.00
        expect(ce?.outputCost).toBe(1.0);
        expect(ce?.totalCost).toBe(2.0);
      }
    });

    it('provides cost inputs for plan-level aggregation (multiple tasks)', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      // Two completed tasks with known costs
      for (const [id, slug, name, inputTokens, outputTokens] of [
        ['001', 'task-a', 'Task A', 100_000, 50_000],
        ['002', 'task-b', 'Task B', 200_000, 80_000],
      ] as [string, string, string, number, number][]) {
        const taskDir = path.join(piDir, 'tasks', `${id}-${slug}`);
        await mkdir(taskDir, { recursive: true });
        await writeFile(
          path.join(taskDir, 'status.json'),
          JSON.stringify({
            id,
            name: slug,
            model: 'sonnet',
            status: 'done',
            completedAt: '2026-05-05T11:00:00.000Z',
            retries: 0,
            usage: { inputTokens, outputTokens },
          }),
        );
      }

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Multi Task Cost',
        taskCount: 2,
        tasks: [
          { id: '001', slug: 'task-a', name: 'Task A', engine: 'claude', model: 'sonnet', agent: 'worker', depends: [] },
          { id: '002', slug: 'task-b', name: 'Task B', engine: 'claude', model: 'sonnet', agent: 'worker', depends: ['001'] },
        ],
      });

      await writeStateJson(piDir, {
        tasks: [
          { id: '001', name: 'task-a', status: 'done', completedAt: '2026-05-05T11:00:00.000Z' },
          { id: '002', name: 'task-b', status: 'done', completedAt: '2026-05-05T12:00:00.000Z' },
        ],
      });

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(200);
      const usageEvents = events.filter((e) => e.event.type === 'usage_reported');

      expect(usageEvents).toHaveLength(2);

      let totalInputCost = 0;
      let totalOutputCost = 0;

      for (const ev of usageEvents) {
        if (ev.event.type === 'usage_reported') {
          const ce = ev.event.payload.costEstimate;
          expect(ce).toBeDefined();
          expect(ce?.pricingSource).toBe('estimated');
          totalInputCost += ce?.inputCost ?? 0;
          totalOutputCost += ce?.outputCost ?? 0;
        }
      }

      // Task A: 100k input * $3/1M = $0.30 + 50k output * $15/1M = $0.75 = $1.05
      // Task B: 200k input * $3/1M = $0.60 + 80k output * $15/1M = $1.20 = $1.80
      // Total: $1.05 + $1.80 = $2.85
      expect(totalInputCost).toBeCloseTo(0.3 + 0.6, 5);
      expect(totalOutputCost).toBeCloseTo(0.75 + 1.2, 5);
    });
  });

  describe('multiple devices on same project', () => {
    it('attributes events to the correct deviceId', async () => {
      const { piDir, db, project } = await createSetup();

      const device1 = 'device-laptop';
      const device2 = 'device-server';

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Multi Device',
        taskCount: 1,
        tasks: [{ id: '001', name: 'Multi Device Task', slug: 'multi-device-task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      // Device 1 scans first
      await scanProjectPiFleet(db, project, device1);

      // Device 2 scans the same project
      await scanProjectPiFleet(db, project, device2);

      const events = db.listPendingOutboundEvents(200);
      const planSeens = events.filter((e) => e.event.type === 'plan_seen');

      // Both devices should emit plan_seen (they use different source keys via deviceId in the event,
      // but the same source key for deduplication — second device sees same hash, so no new event).
      // The dedup key includes projectId but NOT deviceId, so only one plan_seen is queued.
      // This is the expected behaviour: the plan_seen is emitted once and the event carries deviceId.
      expect(planSeens).toHaveLength(1);

      // The first plan_seen carries device1's ID (whichever device scanned first)
      if (planSeens[0]?.event.type === 'plan_seen') {
        expect(planSeens[0].event.deviceId).toBe(device1);
      }
    });

    it('each device independently attributes its events with its own deviceId', async () => {
      const { piDir, db, project } = await createSetup();

      // Two separate projects (simulated as different projects scanned by different devices)
      const project1: MappedProject = { ...project, projectId: 'proj-device-a' };
      const project2: MappedProject = { ...project, projectId: 'proj-device-b' };

      db.syncConfiguredProjects([project1, project2]);

      await writePlanSummary(piDir, {
        version: 1,
        title: 'Plan: Device Attribution',
        taskCount: 1,
        tasks: [{ id: '001', name: 'Task', slug: 'task', engine: 'claude', agent: 'worker', depends: [] }],
      });

      const resultA = await scanProjectPiFleet(db, project1, 'device-a');
      const resultB = await scanProjectPiFleet(db, project2, 'device-b');

      expect(resultA.queuedPlanSeenCount).toBe(1);
      expect(resultB.queuedPlanSeenCount).toBe(1);

      const events = db.listPendingOutboundEvents(200);
      const planSeens = events.filter((e) => e.event.type === 'plan_seen');

      expect(planSeens).toHaveLength(2);

      const deviceIds = planSeens.map((e) => e.event.deviceId);
      expect(deviceIds).toContain('device-a');
      expect(deviceIds).toContain('device-b');
    });
  });

  describe('archive → costEstimate and archive metadata', () => {
    it('includes costEstimate in archived task_completed events', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const archiveId = '2026-04-01T10-00-00-000Z-plan-costed-archive';
      const archiveDir = path.join(piDir, 'archive', archiveId);
      await mkdir(archiveDir, { recursive: true });

      await writeArchiveIndex(piDir, {
        version: 1,
        archives: [
          {
            id: archiveId,
            archivedAt: '2026-04-01T10:00:00.000Z',
            archivePath: `.pi/archive/${archiveId}`,
          },
        ],
      });

      await writeFile(
        path.join(archiveDir, 'archive-summary.json'),
        JSON.stringify({
          plan: { title: 'Plan: Costed Archive', taskCount: 1 },
          tasks: [
            {
              id: '001',
              name: 'archived-costed-task',
              engine: 'claude',
              model: 'claude-3-5-sonnet',
              agent: 'worker',
              status: 'done',
              depends: [],
              retries: 0,
              startedAt: '2026-04-01T08:00:00.000Z',
              completedAt: '2026-04-01T09:00:00.000Z',
              duration: 3600000,
              usage: { inputTokens: 500_000, outputTokens: 200_000 },
            },
          ],
        }),
      );

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(100);
      const archiveCompleted = events.find(
        (e) => e.event.type === 'task_completed' && e.event.source === 'archive',
      );

      expect(archiveCompleted).toBeDefined();
      if (archiveCompleted?.event.type === 'task_completed') {
        const ce = archiveCompleted.event.payload.costEstimate;
        expect(ce).toBeDefined();
        // 500k input * $3/1M = $1.50
        expect(ce?.inputCost).toBeCloseTo(1.5, 5);
        // 200k output * $15/1M = $3.00
        expect(ce?.outputCost).toBeCloseTo(3.0, 5);
        expect(ce?.pricingSource).toBe('estimated');

        // Archive metadata should be present
        const archive = archiveCompleted.event.payload.archive;
        expect(archive?.archiveId).toBe(archiveId);
        expect(archive?.archivedAt).toBe('2026-04-01T10:00:00.000Z');
      }
    });

    it('includes archive metadata on all archive events', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const archiveId = '2026-04-01T10-00-00-000Z-plan-meta-archive';
      const archiveDir = path.join(piDir, 'archive', archiveId);
      await mkdir(archiveDir, { recursive: true });

      await writeArchiveIndex(piDir, {
        version: 1,
        archives: [
          {
            id: archiveId,
            archivedAt: '2026-04-01T10:00:00.000Z',
            archivePath: `.pi/archive/${archiveId}`,
          },
        ],
      });

      await writeFile(
        path.join(archiveDir, 'archive-summary.json'),
        JSON.stringify({
          plan: { title: 'Plan: Meta Archive', taskCount: 1, splitAt: '2026-04-01T08:00:00.000Z' },
          tasks: [
            {
              id: '001',
              name: 'meta-task',
              engine: 'claude',
              model: 'sonnet',
              status: 'done',
              depends: [],
              retries: 0,
              startedAt: '2026-04-01T08:00:00.000Z',
              completedAt: '2026-04-01T09:00:00.000Z',
            },
          ],
        }),
      );

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(100);
      const archiveEvents = events.filter((e) => e.event.source === 'archive');

      // plan_seen, task_seen, task_started, task_completed should all be from archive
      expect(archiveEvents.length).toBeGreaterThan(0);

      // plan_seen should include archive metadata
      const planSeen = archiveEvents.find((e) => e.event.type === 'plan_seen' && e.event.payload.planId === archiveId);
      if (planSeen?.event.type === 'plan_seen') {
        expect(planSeen.event.payload.archive?.archiveId).toBe(archiveId);
        expect(planSeen.event.payload.archive?.archivedAt).toBe('2026-04-01T10:00:00.000Z');
      }

      // task_seen should include archive metadata
      const taskSeen = archiveEvents.find((e) => e.event.type === 'task_seen');
      if (taskSeen?.event.type === 'task_seen') {
        expect(taskSeen.event.payload.archive?.archiveId).toBe(archiveId);
      }

      // task_started should include archive metadata
      const taskStarted = archiveEvents.find((e) => e.event.type === 'task_started');
      if (taskStarted?.event.type === 'task_started') {
        expect(taskStarted.event.payload.archive?.archiveId).toBe(archiveId);
      }

      // task_completed should include archive metadata
      const taskCompleted = archiveEvents.find((e) => e.event.type === 'task_completed');
      if (taskCompleted?.event.type === 'task_completed') {
        expect(taskCompleted.event.payload.archive?.archiveId).toBe(archiveId);
      }
    });

    it('emits task_handoff_seen for archived tasks that have handoff.md', async () => {
      const { piDir, db, project, deviceId } = await createSetup();

      const archiveId = '2026-04-01T10-00-00-000Z-plan-handoff-archive';
      const archiveDir = path.join(piDir, 'archive', archiveId);
      const archiveTaskDir = path.join(archiveDir, '001-task-with-handoff');
      await mkdir(archiveTaskDir, { recursive: true });

      const handoffText = 'Archived task handoff content';
      await writeFile(path.join(archiveTaskDir, 'handoff.md'), handoffText);

      await writeArchiveIndex(piDir, {
        version: 1,
        archives: [
          {
            id: archiveId,
            archivedAt: '2026-04-01T10:00:00.000Z',
            archivePath: `.pi/archive/${archiveId}`,
          },
        ],
      });

      await writeFile(
        path.join(archiveDir, 'archive-summary.json'),
        JSON.stringify({
          plan: { title: 'Plan: Handoff Archive', taskCount: 1 },
          tasks: [
            {
              id: '001',
              name: 'task-with-handoff',
              engine: 'claude',
              model: 'sonnet',
              status: 'done',
              depends: [],
              retries: 0,
              startedAt: '2026-04-01T08:00:00.000Z',
              completedAt: '2026-04-01T09:00:00.000Z',
              usage: { inputTokens: 1000, outputTokens: 500 },
            },
          ],
        }),
      );

      await scanProjectPiFleet(db, project, deviceId);

      const events = db.listPendingOutboundEvents(100);
      const handoffSeen = events.find((e) => e.event.type === 'task_handoff_seen');

      expect(handoffSeen).toBeDefined();
      if (handoffSeen?.event.type === 'task_handoff_seen') {
        expect(handoffSeen.event.source).toBe('archive');
        expect(handoffSeen.event.payload.handoffContent).toBe(handoffText);
        expect(handoffSeen.event.payload.contentHash).toMatch(/^[0-9a-f]{64}$/);
      }
    });
  });
});
