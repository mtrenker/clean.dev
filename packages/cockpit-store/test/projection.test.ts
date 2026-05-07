/**
 * Unit tests for foldEventsIntoState.
 *
 * Uses Node.js built-in test runner (no external test framework required).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { cockpitProtocolSchemaVersion } from '@cleandev/cockpit-protocol';
import type { CockpitEvent } from '@cleandev/cockpit-protocol';

import {
  HEARTBEAT_STALE_MS,
  emptyProjectedState,
  foldEventsIntoState,
} from '../src/projection';

// ── Fixture helpers ────────────────────────────────────────────────────────────

const BASE_PROJECT_ID = 'proj-abc';
const BASE_DEVICE_ID = 'device-xyz';

function nowIso(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

function makeEvent<T extends CockpitEvent['type']>(
  type: T,
  sequence: number,
  payload: Extract<CockpitEvent, { type: T }>['payload'],
  overrides: Partial<CockpitEvent> = {},
): Extract<CockpitEvent, { type: T }> {
  return {
    schemaVersion: cockpitProtocolSchemaVersion,
    eventId: `evt-${type}-${sequence}`,
    sequence,
    occurredAt: nowIso(),
    source: 'live',
    projectId: BASE_PROJECT_ID,
    deviceId: BASE_DEVICE_ID,
    type,
    payload,
    ...overrides,
  } as Extract<CockpitEvent, { type: T }>;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

test('emptyProjectedState returns correct shape', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  assert.equal(state.projectId, BASE_PROJECT_ID);
  assert.equal(state.schemaVersion, cockpitProtocolSchemaVersion);
  assert.deepEqual(state.worktrees, {});
  assert.deepEqual(state.plans, {});
  assert.deepEqual(state.tasks, {});
  assert.equal(state.dirty, true); // no activity → stale
});

test('fold with empty events returns stale state', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const result = foldEventsIntoState(state, [], new Date());
  assert.equal(result.dirty, true);
  assert.equal(result.schemaVersion, cockpitProtocolSchemaVersion);
});

test('project_seen: sets projectName, localRootPath and telemetry', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const event = makeEvent('project_seen', 1, {
    projectName: 'My Project',
    localRootPath: '/home/user/project',
    telemetry: {
      worktreePath: 'relative',
      repoRootPath: 'off',
      git: 'full',
      progressText: false,
      usage: true,
      planText: true,
      taskDescription: true,
    },
  });
  const result = foldEventsIntoState(state, [event], new Date());
  assert.equal(result.projectName, 'My Project');
  assert.equal(result.localRootPath, '/home/user/project');
  assert.equal(result.telemetry?.git, 'full');
});

test('project_seen does not overwrite existing name when field is absent', () => {
  let state = emptyProjectedState(BASE_PROJECT_ID);
  state = { ...state, projectName: 'Existing' };
  const event = makeEvent('project_seen', 2, {
    telemetry: {
      worktreePath: 'relative',
      repoRootPath: 'off',
      git: 'full',
      progressText: false,
      usage: true,
      planText: true,
      taskDescription: true,
    },
  });
  const result = foldEventsIntoState(state, [event], new Date());
  assert.equal(result.projectName, 'Existing');
});

test('project_heartbeat: sets lastHeartbeat and dirty=false when fresh', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const now = new Date();
  const event = makeEvent(
    'project_heartbeat',
    1,
    { daemonVersion: '1.2.3', activePlanId: 'plan-1', activeTaskCount: 2 },
    { occurredAt: now.toISOString() },
  );
  const result = foldEventsIntoState(state, [event], now);
  assert.ok(result.lastHeartbeat);
  assert.equal(result.lastHeartbeat.daemonVersion, '1.2.3');
  assert.equal(result.lastHeartbeat.activeTaskCount, 2);
  assert.equal(result.dirty, false); // fresh heartbeat
});

test('project_heartbeat: dirty=true when heartbeat is stale', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const staleTime = new Date(Date.now() - HEARTBEAT_STALE_MS - 1000);
  const event = makeEvent(
    'project_heartbeat',
    1,
    { activeTaskCount: 0 },
    { occurredAt: staleTime.toISOString() },
  );
  const result = foldEventsIntoState(state, [event], new Date());
  assert.equal(result.dirty, true);
});

test('fallback to lastEvent time for staleness when no heartbeat', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const freshTime = new Date();
  const event = makeEvent(
    'project_seen',
    1,
    {
      telemetry: {
        worktreePath: 'off',
        repoRootPath: 'off',
        git: 'off',
        progressText: false,
        usage: false,
        planText: false,
        taskDescription: false,
      },
    },
    { occurredAt: freshTime.toISOString() },
  );
  const result = foldEventsIntoState(state, [event], freshTime);
  // Recent event but no heartbeat → not stale
  assert.equal(result.dirty, false);
});

test('worktree_seen: adds worktree to map', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const event = makeEvent('worktree_seen', 1, {
    worktree: { worktreeId: 'wt-1', branch: 'main', isDirty: false, untrackedCount: 0 },
  });
  const result = foldEventsIntoState(state, [event], new Date());
  assert.ok(result.worktrees['wt-1']);
  assert.equal(result.worktrees['wt-1'].branch, 'main');
});

test('worktree_changed: replaces existing snapshot', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const seen = makeEvent('worktree_seen', 1, {
    worktree: { worktreeId: 'wt-1', branch: 'main', isDirty: false, untrackedCount: 0 },
  });
  const changed = makeEvent('worktree_changed', 2, {
    worktree: { worktreeId: 'wt-1', branch: 'feature/x', isDirty: true, untrackedCount: 3 },
    previousHeadSha: null,
  });
  const result = foldEventsIntoState(state, [seen, changed], new Date());
  assert.equal(result.worktrees['wt-1'].branch, 'feature/x');
  assert.equal(result.worktrees['wt-1'].isDirty, true);
});

test('plan_seen: adds plan to plans map', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const event = makeEvent('plan_seen', 1, {
    planId: 'plan-1',
    title: 'My Plan',
    taskCount: 0,
    tasks: [],
  });
  const result = foldEventsIntoState(state, [event], new Date());
  assert.ok(result.plans['plan-1']);
  assert.equal(result.plans['plan-1'].title, 'My Plan');
});

test('task lifecycle: seen → started → completed', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const events: CockpitEvent[] = [
    makeEvent('task_seen', 1, {
      planId: 'plan-1',
      taskId: 'task-1',
      taskName: 'Build',
      dependsOn: [],
      execution: {},
    }),
    makeEvent('task_started', 2, {
      planId: 'plan-1',
      taskId: 'task-1',
      taskName: 'Build',
      status: 'running',
      startedAt: nowIso(-5000),
      execution: {},
    }),
    makeEvent('task_progressed', 3, {
      planId: 'plan-1',
      taskId: 'task-1',
      taskName: 'Build',
      progressStatus: 'running',
      step: 'Compiling',
      progressVisible: true,
      progressAt: nowIso(-3000),
    }),
    makeEvent('task_completed', 4, {
      planId: 'plan-1',
      taskId: 'task-1',
      taskName: 'Build',
      status: 'done',
      completedAt: nowIso(),
      retries: 0,
    }),
  ];
  const result = foldEventsIntoState(state, events, new Date());
  const task = result.tasks['task-1'];
  assert.ok(task);
  assert.equal(task.status, 'done');
  assert.ok(task.startedAt);
  assert.ok(task.completedAt);
  assert.equal(task.latestProgress?.step, 'Compiling');
  assert.equal(result.lastEvent?.sequence, 4);
});

test('task_failed: sets status=failed with error', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const event = makeEvent('task_failed', 1, {
    planId: 'plan-1',
    taskId: 'task-1',
    taskName: 'Build',
    status: 'failed',
    retries: 1,
    error: 'Something went wrong',
  });
  const result = foldEventsIntoState(state, [event], new Date());
  assert.equal(result.tasks['task-1']?.status, 'failed');
  assert.equal(result.tasks['task-1']?.error, 'Something went wrong');
});

test('usage_reported: accumulates token counts on existing task', () => {
  let state = emptyProjectedState(BASE_PROJECT_ID);
  const seen = makeEvent('task_seen', 1, {
    planId: 'plan-1',
    taskId: 'task-1',
    taskName: 'T',
    dependsOn: [],
    execution: {},
  });
  state = foldEventsIntoState(state, [seen], new Date());

  const usage1 = makeEvent('usage_reported', 2, {
    planId: 'plan-1',
    taskId: 'task-1',
    usage: { inputTokens: 100, outputTokens: 50 },
  });
  const usage2 = makeEvent('usage_reported', 3, {
    planId: 'plan-1',
    taskId: 'task-1',
    usage: { inputTokens: 200, outputTokens: 100 },
  });
  const result = foldEventsIntoState(state, [usage1, usage2], new Date());
  assert.deepEqual(result.tasks['task-1']?.usage, {
    inputTokens: 300,
    outputTokens: 150,
  });
});

test('usage_reported without matching task is a no-op', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const event = makeEvent('usage_reported', 1, {
    taskId: 'nonexistent',
    usage: { inputTokens: 100, outputTokens: 50 },
  });
  const result = foldEventsIntoState(state, [event], new Date());
  assert.deepEqual(result.tasks, {});
});

test('events processed in ascending sequence order regardless of input order', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const seen = makeEvent('task_seen', 1, {
    planId: 'plan-1', taskId: 'task-1', taskName: 'T', dependsOn: [], execution: {},
  });
  const started = makeEvent('task_started', 3, {
    planId: 'plan-1', taskId: 'task-1', taskName: 'T', status: 'running',
    startedAt: nowIso(), execution: {},
  });
  const completed = makeEvent('task_completed', 5, {
    planId: 'plan-1', taskId: 'task-1', taskName: 'T', status: 'done',
    completedAt: nowIso(), retries: 0,
  });
  // Supply in reversed order
  const result = foldEventsIntoState(state, [completed, started, seen], new Date());
  assert.equal(result.tasks['task-1']?.status, 'done');
  assert.equal(result.lastEvent?.sequence, 5);
});

test('idempotent: folding same events twice yields same result', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const now = new Date();
  const events: CockpitEvent[] = [
    makeEvent('project_seen', 1, {
      projectName: 'P',
      telemetry: {
        worktreePath: 'relative', repoRootPath: 'off', git: 'full',
        progressText: false, usage: true, planText: true, taskDescription: true,
      },
    }, { occurredAt: now.toISOString() }),
    makeEvent('worktree_seen', 2, {
      worktree: { worktreeId: 'wt-1', branch: 'main', isDirty: false, untrackedCount: 0 },
    }, { occurredAt: now.toISOString() }),
  ];
  const first = foldEventsIntoState(state, events, now);
  const second = foldEventsIntoState(first, events, now);
  assert.deepEqual(second, first);
});

test('does not mutate the input state object', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const original = { ...state };
  const event = makeEvent('project_seen', 1, {
    projectName: 'Mutation Test',
    telemetry: {
      worktreePath: 'off', repoRootPath: 'off', git: 'off',
      progressText: false, usage: false, planText: false, taskDescription: false,
    },
  });
  foldEventsIntoState(state, [event], new Date());
  // The original state should be unchanged
  assert.equal(state.projectName, original.projectName);
  assert.deepEqual(state.worktrees, original.worktrees);
});
