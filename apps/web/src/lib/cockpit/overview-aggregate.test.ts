import { describe, it, expect } from 'vitest';
import type {
  CockpitProjectedProjectState,
  CockpitProjectedTaskState,
} from '@cleandev/cockpit-store';
import type { WorktreeSnapshot } from '@cleandev/cockpit-protocol';
import {
  buildFleetOverview,
  buildActiveDeviceRows,
  buildRunningAgentRows,
  buildWorktreeHygieneRows,
  buildRecentHandoffRows,
  buildArchivedPlanRows,
  buildUsageBreakdown,
  worktreeNeedsCleanup,
} from './overview-aggregate';

const NOW_ISO = '2026-05-08T12:00:00.000Z';
const NOW = Date.parse(NOW_ISO);

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

describe('buildFleetOverview', () => {
  it('counts active, stale and offline projects', () => {
    const map = new Map([
      ['a', makeState({ projectId: 'a', dirty: false })],
      [
        'b',
        makeState({
          projectId: 'b',
          dirty: true,
          lastHeartbeat: {
            occurredAt: NOW_ISO,
            activeTaskCount: 0,
          },
        }),
      ],
      ['c', makeState({ projectId: 'c', dirty: true, lastHeartbeat: null })],
      ['d', null as never], // missing projection => offline
    ]);
    const overview = buildFleetOverview(map);
    expect(overview.totalProjects).toBe(4);
    expect(overview.activeProjects).toBe(1);
    expect(overview.staleProjects).toBe(1);
    expect(overview.offlineProjects).toBe(2);
  });

  it('sums running agents, failed tasks, dirty worktrees and cost', () => {
    const map = new Map([
      [
        'a',
        makeState({
          tasks: {
            t1: makeTask({ taskId: 't1', status: 'running' }),
            t2: makeTask({ taskId: 't2', status: 'failed' }),
            t3: makeTask({ taskId: 't3', status: 'done' }),
          },
          worktrees: {
            w1: makeWorktree({ worktreeId: 'w1', isDirty: true }),
            w2: makeWorktree({ worktreeId: 'w2', aheadCount: 2 }),
            w3: makeWorktree({ worktreeId: 'w3' }), // clean
          },
          projectUsage: { inputTokens: 1000, outputTokens: 500 },
          projectCostEstimate: {
            currency: 'USD',
            inputCost: 0.05,
            outputCost: 0.05,
            totalCost: 0.1,
          },
        }),
      ],
    ]);
    const overview = buildFleetOverview(map);
    expect(overview.runningAgents).toBe(1);
    expect(overview.failedTasks).toBe(1);
    expect(overview.worktreesNeedingCleanup).toBe(2);
    expect(overview.totalInputTokens).toBe(1000);
    expect(overview.totalOutputTokens).toBe(500);
    expect(overview.totalEstimatedCostUsd).toBeCloseTo(0.1);
  });

  it('counts pending archived plans for review', () => {
    const map = new Map([
      [
        'a',
        makeState({
          archivedPlanIds: ['p1', 'p2', 'p3'],
          plans: {
            p1: {
              planId: 'p1',
              title: 'Pending',
              taskCount: 0,
              tasks: [],
              lastSeenAt: NOW_ISO,
              source: 'archive',
              archive: { reviewStatus: 'pending' },
            },
            p2: {
              planId: 'p2',
              title: 'Reviewed',
              taskCount: 0,
              tasks: [],
              lastSeenAt: NOW_ISO,
              source: 'archive',
              archive: { reviewStatus: 'reviewed' },
            },
            p3: {
              planId: 'p3',
              title: 'No status',
              taskCount: 0,
              tasks: [],
              lastSeenAt: NOW_ISO,
              source: 'archive',
              archive: null,
            },
          },
        }),
      ],
    ]);
    const overview = buildFleetOverview(map);
    expect(overview.archivedPlansAwaitingReview).toBe(2); // pending + null
  });
});

describe('buildActiveDeviceRows', () => {
  it('flattens activeFleet across projects and sorts by activity then heartbeat', () => {
    const map = new Map([
      [
        'a',
        makeState({
          projectId: 'a',
          projectName: 'Alpha',
          activeFleet: [
            {
              deviceId: 'dev-a1',
              deviceName: 'workstation',
              activeTaskCount: 1,
              lastHeartbeatAt: '2026-05-08T11:00:00.000Z',
            },
          ],
        }),
      ],
      [
        'b',
        makeState({
          projectId: 'b',
          projectName: 'Beta',
          activeFleet: [
            {
              deviceId: 'dev-b1',
              activeTaskCount: 3,
              lastHeartbeatAt: '2026-05-08T11:55:00.000Z',
            },
            {
              deviceId: 'dev-b2',
              activeTaskCount: 1,
              lastHeartbeatAt: '2026-05-08T11:59:00.000Z',
            },
          ],
        }),
      ],
    ]);
    const rows = buildActiveDeviceRows(map);
    expect(rows).toHaveLength(3);
    expect(rows[0].deviceId).toBe('dev-b1'); // count 3 wins
    expect(rows[1].deviceId).toBe('dev-b2'); // count 1, fresher heartbeat
    expect(rows[2].deviceId).toBe('dev-a1');
    expect(rows[0].projectName).toBe('Beta');
  });

  it('returns empty when no project has any active devices', () => {
    const map = new Map([['a', makeState()]]);
    expect(buildActiveDeviceRows(map)).toEqual([]);
  });
});

describe('buildRunningAgentRows', () => {
  it('selects only running tasks, computes duration, sorts longest-running first', () => {
    const map = new Map([
      [
        'a',
        makeState({
          tasks: {
            t1: makeTask({
              taskId: 't1',
              status: 'running',
              startedAt: '2026-05-08T11:50:00.000Z', // 10min ago
            }),
            t2: makeTask({
              taskId: 't2',
              status: 'running',
              startedAt: '2026-05-08T11:30:00.000Z', // 30min ago — longest
            }),
            t3: makeTask({ taskId: 't3', status: 'done' }),
          },
        }),
      ],
    ]);
    const rows = buildRunningAgentRows(map, NOW);
    expect(rows.map((r) => r.task.taskId)).toEqual(['t2', 't1']);
    expect(rows[0].durationMs).toBe(30 * 60_000);
  });
});

describe('buildWorktreeHygieneRows', () => {
  it('returns only worktrees that need cleanup and tags reasons', () => {
    const map = new Map([
      [
        'a',
        makeState({
          worktrees: {
            w1: makeWorktree({ worktreeId: 'w1' }), // clean — excluded
            w2: makeWorktree({
              worktreeId: 'w2',
              isDirty: true,
              untrackedCount: 3,
              aheadCount: 2,
              behindCount: 1,
              lastObservedAt: NOW_ISO,
            }),
            w3: makeWorktree({
              worktreeId: 'w3',
              aheadCount: 1,
              behindCount: 0,
              lastObservedAt: '2026-05-07T00:00:00.000Z',
            }),
          },
        }),
      ],
    ]);
    const rows = buildWorktreeHygieneRows(map);
    expect(rows.map((r) => r.worktree.worktreeId)).toEqual(['w2', 'w3']);
    expect(rows[0].reasons).toContain('dirty');
    expect(rows[0].reasons).toContain('untracked');
    expect(rows[0].reasons).toContain('diverged'); // ahead + behind
    expect(rows[1].reasons).toEqual(['ahead']);
  });

  it('worktreeNeedsCleanup returns true for any non-clean signal', () => {
    expect(worktreeNeedsCleanup(makeWorktree())).toBe(false);
    expect(worktreeNeedsCleanup(makeWorktree({ isDirty: true }))).toBe(true);
    expect(worktreeNeedsCleanup(makeWorktree({ untrackedCount: 1 }))).toBe(true);
    expect(worktreeNeedsCleanup(makeWorktree({ behindCount: 2 }))).toBe(true);
  });
});

describe('buildRecentHandoffRows', () => {
  it('prioritises tasks with handoff, then by completion time', () => {
    const map = new Map([
      [
        'a',
        makeState({
          tasks: {
            t1: makeTask({
              taskId: 't1',
              status: 'done',
              completedAt: '2026-05-08T11:30:00.000Z',
              handoffSummary: 'short summary',
            }),
            t2: makeTask({
              taskId: 't2',
              status: 'done',
              completedAt: '2026-05-08T11:55:00.000Z', // newer but no handoff
            }),
            t3: makeTask({
              taskId: 't3',
              status: 'done',
              completedAt: '2026-05-08T11:00:00.000Z',
              handoffSummary: 'older but with handoff',
            }),
            t4: makeTask({ taskId: 't4', status: 'running' }), // excluded
          },
        }),
      ],
    ]);
    const rows = buildRecentHandoffRows(map);
    expect(rows.map((r) => r.task.taskId)).toEqual(['t1', 't3', 't2']);
  });
});

describe('buildArchivedPlanRows', () => {
  it('orders pending review before reviewed, then by archivedAt desc', () => {
    const map = new Map([
      [
        'a',
        makeState({
          archivedPlanIds: ['p1', 'p2', 'p3'],
          plans: {
            p1: {
              planId: 'p1',
              title: 'Old reviewed',
              taskCount: 0,
              tasks: [],
              lastSeenAt: NOW_ISO,
              source: 'archive',
              archive: {
                reviewStatus: 'reviewed',
                archivedAt: '2026-05-07T00:00:00.000Z',
              },
            },
            p2: {
              planId: 'p2',
              title: 'Pending recent',
              taskCount: 4,
              tasks: [],
              lastSeenAt: NOW_ISO,
              source: 'archive',
              archive: {
                reviewStatus: 'pending',
                archivedAt: '2026-05-08T10:00:00.000Z',
              },
            },
            p3: {
              planId: 'p3',
              title: 'Pending older',
              taskCount: 1,
              tasks: [],
              lastSeenAt: NOW_ISO,
              source: 'archive',
              archive: {
                reviewStatus: 'pending',
                archivedAt: '2026-05-06T00:00:00.000Z',
              },
            },
          },
        }),
      ],
    ]);
    const rows = buildArchivedPlanRows(map);
    expect(rows.map((r) => r.planId)).toEqual(['p2', 'p3', 'p1']);
    expect(rows[0].reviewStatus).toBe('pending');
  });
});

describe('buildUsageBreakdown', () => {
  it('aggregates by engine + model + profile and sorts by cost desc', () => {
    const map = new Map([
      [
        'a',
        makeState({
          tasks: {
            t1: makeTask({
              taskId: 't1',
              execution: { engine: 'claude', model: 'opus-4', profile: 'frontend' },
              usage: { inputTokens: 1000, outputTokens: 500 },
              costEstimate: { currency: 'USD', inputCost: 0.5, outputCost: 0.5, totalCost: 1.0 },
            }),
            t2: makeTask({
              taskId: 't2',
              execution: { engine: 'claude', model: 'opus-4', profile: 'frontend' },
              usage: { inputTokens: 200, outputTokens: 100 },
              costEstimate: { currency: 'USD', inputCost: 0.1, outputCost: 0.1, totalCost: 0.2 },
            }),
            t3: makeTask({
              taskId: 't3',
              execution: { engine: 'claude', model: 'sonnet-4', profile: 'backend' },
              usage: { inputTokens: 500, outputTokens: 1500 },
              costEstimate: { currency: 'USD', inputCost: 0.05, outputCost: 0.15, totalCost: 0.2 },
            }),
            t4: makeTask({
              taskId: 't4',
              execution: {},
              usage: { inputTokens: 10, outputTokens: 5 },
            }),
          },
        }),
      ],
    ]);
    const breakdown = buildUsageBreakdown(map);

    expect(breakdown.rows).toHaveLength(3);
    // claude/opus-4/frontend wins on cost (1.0 + 0.2)
    const top = breakdown.rows[0];
    expect(top.engine).toBe('claude');
    expect(top.model).toBe('opus-4');
    expect(top.profile).toBe('frontend');
    expect(top.taskCount).toBe(2);
    expect(top.inputTokens).toBe(1200);
    expect(top.outputTokens).toBe(600);
    expect(top.estimatedCostUsd).toBeCloseTo(1.2);

    // Engine totals
    const engine = breakdown.byEngine.find((e) => e.name === 'claude');
    expect(engine?.taskCount).toBe(3);
    expect(engine?.usage.inputTokens).toBe(1700);

    // Empty execution becomes "—"
    const fallback = breakdown.rows.find((r) => r.engine === '—');
    expect(fallback).toBeDefined();
  });
});
