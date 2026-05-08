import { describe, it, expect } from 'vitest';
import type {
  CockpitProjectedProjectState,
  CockpitProjectedTaskState,
  CockpitProjectedPlanState,
} from '@cleandev/cockpit-store';
import type { WorktreeSnapshot } from '@cleandev/cockpit-protocol';
import {
  buildProjectSummary,
  buildWorktreeGroupRows,
  buildProjectDeviceRows,
  bucketTasks,
  bucketPlans,
  buildProjectUsageBreakdown,
  findTask,
  findPlan,
  isArchivedTask,
} from './project-detail';

const NOW_ISO = '2026-05-08T12:00:00.000Z';

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

function makeTask(
  overrides: Partial<CockpitProjectedTaskState> = {},
): CockpitProjectedTaskState {
  return {
    taskId: 't-1',
    planId: 'plan-1',
    taskName: 'Task 1',
    dependsOn: [],
    status: 'done',
    ...overrides,
  };
}

function makePlan(
  overrides: Partial<CockpitProjectedPlanState> = {},
): CockpitProjectedPlanState {
  return {
    planId: 'plan-1',
    title: 'Plan 1',
    taskCount: 0,
    tasks: [],
    lastSeenAt: NOW_ISO,
    source: 'live',
    ...overrides,
  };
}

function makeWorktree(
  overrides: Partial<WorktreeSnapshot> = {},
): WorktreeSnapshot {
  return {
    worktreeId: 'wt-1',
    isDirty: false,
    untrackedCount: 0,
    aheadCount: 0,
    behindCount: 0,
    ...overrides,
  };
}

describe('buildProjectSummary', () => {
  it('returns zeros when state is null', () => {
    const summary = buildProjectSummary(null);
    expect(summary.totalDevices).toBe(0);
    expect(summary.runningTasks).toBe(0);
    expect(summary.totalEstimatedCostUsd).toBe(0);
  });

  it('counts devices, worktrees, plans, tasks and cost', () => {
    const state = makeState({
      devices: {
        d1: {
          deviceId: 'd1',
          deviceName: 'dev-1',
          instanceName: null,
          labels: [],
          source: 'live',
          lastEventAt: NOW_ISO,
          lastEventType: 'project_heartbeat',
        },
        d2: {
          deviceId: 'd2',
          deviceName: 'dev-2',
          instanceName: null,
          labels: [],
          source: 'live',
          lastEventAt: NOW_ISO,
          lastEventType: 'project_heartbeat',
        },
      },
      activeFleet: [
        {
          deviceId: 'd1',
          activeTaskCount: 2,
          lastHeartbeatAt: NOW_ISO,
        },
      ],
      worktrees: {
        wt1: makeWorktree({ worktreeId: 'wt1', isDirty: true }),
        wt2: makeWorktree({ worktreeId: 'wt2' }),
      },
      worktreeGroups: { default: ['wt1', 'wt2'] },
      plans: {
        p1: makePlan({ planId: 'p1', source: 'live', taskCount: 2 }),
        p2: makePlan({
          planId: 'p2',
          source: 'archive',
          taskCount: 1,
          archive: { reviewStatus: 'pending' },
        }),
      },
      archivedPlanIds: ['p2'],
      tasks: {
        t1: makeTask({ taskId: 't1', status: 'running' }),
        t2: makeTask({ taskId: 't2', status: 'done' }),
        t3: makeTask({ taskId: 't3', status: 'failed' }),
        t4: makeTask({
          taskId: 't4',
          source: 'archive',
          status: 'done',
        }),
      },
      archivedTaskIds: ['t4'],
      projectUsage: { inputTokens: 1000, outputTokens: 500 },
      projectCostEstimate: {
        currency: 'USD',
        inputCost: 0.1,
        outputCost: 0.2,
        totalCost: 0.3,
      },
    });

    const summary = buildProjectSummary(state);
    expect(summary.totalDevices).toBe(2);
    expect(summary.activeDevices).toBe(1);
    expect(summary.staleDevices).toBe(1);
    expect(summary.worktreeCount).toBe(2);
    expect(summary.worktreesNeedingCleanup).toBe(1);
    expect(summary.livePlans).toBe(1);
    expect(summary.archivedPlans).toBe(1);
    expect(summary.archivedPlansAwaitingReview).toBe(1);
    expect(summary.liveTasks).toBe(3);
    expect(summary.archivedTasks).toBe(1);
    expect(summary.runningTasks).toBe(1);
    expect(summary.failedTasks).toBe(1);
    expect(summary.completedTasks).toBe(2); // both live (done) and archived (done)
    expect(summary.totalInputTokens).toBe(1000);
    expect(summary.totalEstimatedCostUsd).toBeCloseTo(0.3);
  });
});

describe('buildWorktreeGroupRows', () => {
  it('returns empty array when state is null', () => {
    expect(buildWorktreeGroupRows(null)).toEqual([]);
  });

  it('groups worktrees and orders cleanup-heavy groups first', () => {
    const state = makeState({
      worktrees: {
        a: makeWorktree({ worktreeId: 'a', branch: 'main' }),
        b: makeWorktree({ worktreeId: 'b', branch: 'feature/x', isDirty: true }),
        c: makeWorktree({ worktreeId: 'c', branch: 'feature/y' }),
      },
      worktreeGroups: {
        canonical: ['a'],
        feature: ['b', 'c'],
      },
    });
    const rows = buildWorktreeGroupRows(state);
    expect(rows.map((r) => r.groupName)).toEqual(['feature', 'canonical']);
    expect(rows[0]?.cleanupCount).toBe(1);
    // Within `feature`, dirty 'b' first.
    expect(rows[0]?.worktrees[0]?.worktreeId).toBe('b');
  });

  it('puts ungrouped worktrees under "default"', () => {
    const state = makeState({
      worktrees: {
        wt: makeWorktree({ worktreeId: 'wt', branch: 'main' }),
      },
      worktreeGroups: {},
    });
    const rows = buildWorktreeGroupRows(state);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.groupName).toBe('default');
  });
});

describe('buildProjectDeviceRows', () => {
  it('orders active devices first', () => {
    const state = makeState({
      devices: {
        idle: {
          deviceId: 'idle',
          deviceName: 'idle',
          instanceName: null,
          labels: [],
          source: 'live',
          lastEventAt: '2026-05-08T11:00:00.000Z',
          lastEventType: 'project_heartbeat',
        },
        live: {
          deviceId: 'live',
          deviceName: 'live',
          instanceName: null,
          labels: [],
          source: 'live',
          lastEventAt: NOW_ISO,
          lastEventType: 'project_heartbeat',
          lastHeartbeat: {
            occurredAt: NOW_ISO,
            activeTaskCount: 3,
          },
        },
      },
      activeFleet: [
        {
          deviceId: 'live',
          activeTaskCount: 3,
          lastHeartbeatAt: NOW_ISO,
        },
      ],
    });
    const rows = buildProjectDeviceRows(state);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.device.deviceId).toBe('live');
    expect(rows[0]?.isActive).toBe(true);
    expect(rows[0]?.activeTaskCount).toBe(3);
    expect(rows[1]?.isActive).toBe(false);
  });
});

describe('bucketTasks', () => {
  it('separates archived tasks regardless of status', () => {
    const state = makeState({
      tasks: {
        running: makeTask({ taskId: 'running', status: 'running' }),
        archived: makeTask({
          taskId: 'archived',
          status: 'done',
          source: 'archive',
        }),
      },
      archivedTaskIds: ['archived'],
    });
    const buckets = bucketTasks(state);
    expect(buckets.running).toHaveLength(1);
    expect(buckets.archived).toHaveLength(1);
    expect(buckets.done).toHaveLength(0);
  });

  it('orders running tasks longest-running first', () => {
    const state = makeState({
      tasks: {
        a: makeTask({
          taskId: 'a',
          status: 'running',
          startedAt: '2026-05-08T11:50:00.000Z',
        }),
        b: makeTask({
          taskId: 'b',
          status: 'running',
          startedAt: '2026-05-08T11:00:00.000Z',
        }),
      },
    });
    const buckets = bucketTasks(state);
    expect(buckets.running.map((t) => t.taskId)).toEqual(['b', 'a']);
  });
});

describe('bucketPlans', () => {
  it('separates archived plans', () => {
    const state = makeState({
      plans: {
        live: makePlan({ planId: 'live', title: 'Live', source: 'live' }),
        arch: makePlan({
          planId: 'arch',
          title: 'Archived',
          source: 'archive',
        }),
      },
      archivedPlanIds: ['arch'],
    });
    const buckets = bucketPlans(state);
    expect(buckets.live).toHaveLength(1);
    expect(buckets.archived).toHaveLength(1);
  });
});

describe('buildProjectUsageBreakdown', () => {
  it('sums per-task costs by execution dimensions', () => {
    const state = makeState({
      engineUsage: {
        claude: { inputTokens: 1000, outputTokens: 500 },
      },
      modelUsage: {
        'claude-4.7': { inputTokens: 1000, outputTokens: 500 },
      },
      profileUsage: {
        balanced: { inputTokens: 1000, outputTokens: 500 },
      },
      tasks: {
        t1: makeTask({
          execution: {
            engine: 'claude',
            model: 'claude-4.7',
            profile: 'balanced',
          },
          costEstimate: {
            currency: 'USD',
            inputCost: 0.05,
            outputCost: 0.05,
            totalCost: 0.1,
          },
        }),
      },
      projectCostEstimate: {
        currency: 'USD',
        inputCost: 0.05,
        outputCost: 0.05,
        totalCost: 0.1,
      },
    });
    const breakdown = buildProjectUsageBreakdown(state);
    expect(breakdown.byEngine).toHaveLength(1);
    expect(breakdown.byEngine[0]?.estimatedCostUsd).toBeCloseTo(0.1);
    expect(breakdown.totalEstimatedCostUsd).toBeCloseTo(0.1);
  });
});

describe('lookup helpers', () => {
  it('findTask, findPlan and isArchivedTask', () => {
    const state = makeState({
      tasks: {
        t1: makeTask({ taskId: 't1' }),
        t2: makeTask({ taskId: 't2', source: 'archive' }),
      },
      archivedTaskIds: ['t2'],
      plans: { p1: makePlan({ planId: 'p1' }) },
    });
    expect(findTask(state, 't1')?.taskId).toBe('t1');
    expect(findTask(state, 'missing')).toBeNull();
    expect(findPlan(state, 'p1')?.planId).toBe('p1');
    expect(isArchivedTask(state, 't2')).toBe(true);
    expect(isArchivedTask(state, 't1')).toBe(false);
    expect(isArchivedTask(null, 'whatever')).toBe(false);
  });
});
