import { describe, it, expect } from 'vitest';
import type {
  CockpitProjectedProjectState,
  CockpitProjectedTaskState,
  CockpitProjectedPlanState,
} from '@cleandev/cockpit-store';
import {
  buildArchivedPlanRows,
  buildArchivedTaskRows,
  buildArchiveRunRows,
  findArchiveRun,
  isArchivedPlan,
  tasksForPlan,
  ARCHIVE_RUN_ID_FALLBACK,
} from './archive-detail';

function makeState(
  overrides: Partial<CockpitProjectedProjectState> = {},
): CockpitProjectedProjectState {
  return {
    schemaVersion: 2,
    projectId: 'proj-a',
    projectName: 'Project A',
    projectSlug: 'project-a',
    localRootPath: '/tmp/project-a',
    telemetry: null,
    observation: null,
    dirty: false,
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
    ...overrides,
  };
}

function task(
  overrides: Partial<CockpitProjectedTaskState> = {},
): CockpitProjectedTaskState {
  return {
    taskId: 't',
    planId: 'p',
    taskName: 'A task',
    dependsOn: [],
    status: 'done',
    ...overrides,
  };
}

function plan(
  overrides: Partial<CockpitProjectedPlanState> = {},
): CockpitProjectedPlanState {
  return {
    planId: 'p',
    title: 'A plan',
    taskCount: 0,
    tasks: [],
    lastSeenAt: '2026-05-01T10:00:00.000Z',
    source: 'live',
    ...overrides,
  };
}

describe('archive-detail helpers', () => {
  describe('buildArchivedPlanRows', () => {
    it('returns [] for null state', () => {
      expect(buildArchivedPlanRows(null)).toEqual([]);
    });

    it('orders pending review first then by archivedAt desc', () => {
      const state = makeState({
        plans: {
          'p-old': plan({
            planId: 'p-old',
            title: 'Old reviewed plan',
            source: 'archive',
            archive: {
              archivedAt: '2026-05-01T10:00:00.000Z',
              reviewStatus: 'reviewed',
            },
          }),
          'p-pending-recent': plan({
            planId: 'p-pending-recent',
            title: 'Recent pending plan',
            source: 'archive',
            archive: {
              archivedAt: '2026-05-07T10:00:00.000Z',
              reviewStatus: 'pending',
            },
          }),
          'p-pending-old': plan({
            planId: 'p-pending-old',
            title: 'Old pending plan',
            source: 'archive',
            archive: {
              archivedAt: '2026-04-30T10:00:00.000Z',
              reviewStatus: 'pending',
            },
          }),
          'p-live': plan({ planId: 'p-live', title: 'Live plan' }),
        },
        archivedPlanIds: ['p-old', 'p-pending-recent', 'p-pending-old'],
      });
      const rows = buildArchivedPlanRows(state);
      expect(rows.map((r) => r.plan.planId)).toEqual([
        'p-pending-recent',
        'p-pending-old',
        'p-old',
      ]);
      expect(rows[0]?.reviewStatus).toBe('pending');
    });

    it('rolls up tokens and cost from archived tasks for the plan', () => {
      const state = makeState({
        plans: {
          'p1': plan({
            planId: 'p1',
            taskCount: 2,
            source: 'archive',
            archive: { archivedAt: '2026-05-07T10:00:00.000Z' },
          }),
        },
        tasks: {
          't1': task({
            taskId: 't1',
            planId: 'p1',
            source: 'archive',
            usage: { inputTokens: 100, outputTokens: 50 },
            costEstimate: {
              currency: 'USD',
              inputCost: 0.1,
              outputCost: 0.2,
              totalCost: 0.3,
            },
          }),
          't2': task({
            taskId: 't2',
            planId: 'p1',
            source: 'archive',
            usage: { inputTokens: 200, outputTokens: 100 },
            costEstimate: {
              currency: 'USD',
              inputCost: 0.2,
              outputCost: 0.4,
              totalCost: 0.6,
            },
          }),
        },
        archivedPlanIds: ['p1'],
        archivedTaskIds: ['t1', 't2'],
      });
      const rows = buildArchivedPlanRows(state);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.inputTokens).toBe(300);
      expect(rows[0]?.outputTokens).toBe(150);
      expect(rows[0]?.costUsd).toBeCloseTo(0.9, 5);
      expect(rows[0]?.taskCount).toBe(2);
      expect(rows[0]?.pendingTaskCount).toBe(2);
    });
  });

  describe('buildArchivedTaskRows', () => {
    it('flags live counterpart when a non-archived task shares the slug', () => {
      const state = makeState({
        tasks: {
          'arc-1': task({
            taskId: 'arc-1',
            slug: 'fix-bug',
            source: 'archive',
            archive: { archivedAt: '2026-05-01T00:00:00.000Z' },
          }),
          'live-1': task({
            taskId: 'live-1',
            slug: 'fix-bug',
            status: 'running',
          }),
        },
        archivedTaskIds: ['arc-1'],
      });
      const rows = buildArchivedTaskRows(state);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.hasLiveCounterpart).toBe(true);
      expect(rows[0]?.liveCounterpartTaskId).toBe('live-1');
    });

    it('returns hasLiveCounterpart=false when slug only exists in archive', () => {
      const state = makeState({
        tasks: {
          'arc-1': task({
            taskId: 'arc-1',
            slug: 'fix-bug',
            source: 'archive',
            archive: { archivedAt: '2026-05-01T00:00:00.000Z' },
          }),
        },
        archivedTaskIds: ['arc-1'],
      });
      const rows = buildArchivedTaskRows(state);
      expect(rows[0]?.hasLiveCounterpart).toBe(false);
      expect(rows[0]?.liveCounterpartTaskId).toBeNull();
    });
  });

  describe('buildArchiveRunRows', () => {
    it('groups archived plans + tasks by runId', () => {
      const state = makeState({
        plans: {
          'p1': plan({
            planId: 'p1',
            source: 'archive',
            archive: {
              archivedAt: '2026-05-07T10:00:00.000Z',
              runId: 'run-A',
            },
          }),
          'p2': plan({
            planId: 'p2',
            source: 'archive',
            archive: {
              archivedAt: '2026-05-07T11:00:00.000Z',
              runId: 'run-A',
            },
          }),
        },
        tasks: {
          't1': task({
            taskId: 't1',
            planId: 'p1',
            source: 'archive',
            usage: { inputTokens: 10, outputTokens: 5 },
            costEstimate: {
              currency: 'USD',
              inputCost: 0.01,
              outputCost: 0.02,
              totalCost: 0.03,
            },
            archive: {
              archivedAt: '2026-05-07T09:00:00.000Z',
              runId: 'run-A',
              reviewStatus: 'pending',
            },
          }),
          't2': task({
            taskId: 't2',
            planId: 'p1',
            source: 'archive',
            archive: {
              archivedAt: '2026-05-06T09:00:00.000Z',
              runId: 'run-B',
              reviewStatus: 'reviewed',
            },
          }),
        },
        archivedPlanIds: ['p1', 'p2'],
        archivedTaskIds: ['t1', 't2'],
      });
      const runs = buildArchiveRunRows(state);
      // run-A is more recent (endedAt=11:00)
      expect(runs.map((r) => r.runId)).toEqual(['run-A', 'run-B']);
      const a = runs[0]!;
      expect(a.planIds.sort()).toEqual(['p1', 'p2']);
      expect(a.taskIds).toEqual(['t1']);
      expect(a.startedAt).toBe('2026-05-07T09:00:00.000Z');
      expect(a.endedAt).toBe('2026-05-07T11:00:00.000Z');
      expect(a.inputTokens).toBe(10);
      expect(a.outputTokens).toBe(5);
      expect(a.costUsd).toBeCloseTo(0.03, 5);
      // 2 plans default-pending + 1 task pending = 3 total pending verdicts
      expect(a.pendingReviews).toBe(3);
    });

    it('groups items without a runId under the fallback bucket', () => {
      const state = makeState({
        plans: {
          'p1': plan({
            planId: 'p1',
            source: 'archive',
            archive: { archivedAt: '2026-05-07T10:00:00.000Z' },
          }),
        },
        archivedPlanIds: ['p1'],
      });
      const runs = buildArchiveRunRows(state);
      expect(runs).toHaveLength(1);
      expect(runs[0]?.runId).toBe(ARCHIVE_RUN_ID_FALLBACK);
    });
  });

  describe('findArchiveRun', () => {
    it('returns the run row by id, or null when missing', () => {
      const state = makeState({
        plans: {
          'p1': plan({
            planId: 'p1',
            source: 'archive',
            archive: {
              archivedAt: '2026-05-07T10:00:00.000Z',
              runId: 'run-X',
            },
          }),
        },
        archivedPlanIds: ['p1'],
      });
      expect(findArchiveRun(state, 'run-X')?.runId).toBe('run-X');
      expect(findArchiveRun(state, 'run-Y')).toBeNull();
    });
  });

  describe('tasksForPlan', () => {
    it('separates archived (review-pending first) from live tasks', () => {
      const state = makeState({
        tasks: {
          'arc-pending': task({
            taskId: 'arc-pending',
            planId: 'p1',
            source: 'archive',
            archive: {
              archivedAt: '2026-05-01T00:00:00.000Z',
              reviewStatus: 'pending',
            },
          }),
          'arc-reviewed': task({
            taskId: 'arc-reviewed',
            planId: 'p1',
            source: 'archive',
            archive: {
              archivedAt: '2026-05-02T00:00:00.000Z',
              reviewStatus: 'reviewed',
            },
          }),
          'live': task({
            taskId: 'live',
            planId: 'p1',
            taskName: 'aa-live',
            status: 'running',
          }),
          'other': task({
            taskId: 'other',
            planId: 'p2',
            source: 'archive',
            archive: { archivedAt: '2026-05-01T00:00:00.000Z' },
          }),
        },
        archivedTaskIds: ['arc-pending', 'arc-reviewed', 'other'],
      });
      const bucket = tasksForPlan(state, 'p1');
      expect(bucket.archived.map((t) => t.taskId)).toEqual([
        'arc-pending',
        'arc-reviewed',
      ]);
      expect(bucket.live.map((t) => t.taskId)).toEqual(['live']);
      expect(bucket.pendingReviewCount).toBe(1);
    });

    it('returns empty bucket when state is null', () => {
      const bucket = tasksForPlan(null, 'p1');
      expect(bucket.archived).toEqual([]);
      expect(bucket.live).toEqual([]);
      expect(bucket.pendingReviewCount).toBe(0);
    });
  });

  describe('isArchivedPlan', () => {
    it('returns true for ids in archivedPlanIds and for source=archive plans', () => {
      const state = makeState({
        plans: {
          'p1': plan({ planId: 'p1', source: 'archive' }),
          'p2': plan({ planId: 'p2' }),
        },
        archivedPlanIds: ['p3'],
      });
      expect(isArchivedPlan(state, 'p1')).toBe(true);
      expect(isArchivedPlan(state, 'p2')).toBe(false);
      expect(isArchivedPlan(state, 'p3')).toBe(true);
      expect(isArchivedPlan(null, 'p1')).toBe(false);
    });
  });
});
