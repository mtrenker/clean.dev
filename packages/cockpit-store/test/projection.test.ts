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
    worktree: {
      worktreeId: 'wt-1',
      branch: 'main',
      displayName: 'main@device',
      groupName: 'device',
      branchUpstream: { trackingBranch: 'origin/main', aheadCount: 1, behindCount: 0 },
      isDirty: false,
      untrackedCount: 0,
    },
  });
  const result = foldEventsIntoState(state, [event], new Date());
  assert.ok(result.worktrees['wt-1']);
  assert.equal(result.worktrees['wt-1'].branch, 'main');
  assert.equal(result.worktrees['wt-1'].displayName, 'main@device');
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
  assert.equal(result.plans['plan-1'].source, 'live');
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
  assert.equal(task.progressHistory?.length, 1);
  assert.equal(result.lastEvent?.sequence, 4);
});

test('project_heartbeat updates per-device observation metadata', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const event = makeEvent('project_heartbeat', 1, {
    daemonVersion: '1.2.3',
    activeTaskCount: 1,
    device: {
      deviceName: 'Martin Laptop',
      instanceName: 'default',
      hostname: 'martin-mbp',
      platform: 'darwin',
    },
  });
  const result = foldEventsIntoState(state, [event], new Date());
  assert.equal(result.devices[BASE_DEVICE_ID]?.deviceName, 'Martin Laptop');
  assert.equal(result.devices[BASE_DEVICE_ID]?.lastHeartbeat?.activeTaskCount, 1);
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
  state = foldEventsIntoState(state, [makeEvent('plan_seen', 0, {
    planId: 'plan-1',
    title: 'Plan',
    taskCount: 1,
    tasks: [],
  })], new Date());
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
  assert.deepEqual(result.plans['plan-1']?.usage, {
    inputTokens: 300,
    outputTokens: 150,
  });
  assert.deepEqual(result.projectUsage, {
    inputTokens: 300,
    outputTokens: 150,
  });
});

test('task_handoff_seen and task_output_seen populate task summaries', () => {
  let state = emptyProjectedState(BASE_PROJECT_ID);
  state = foldEventsIntoState(state, [makeEvent('task_seen', 1, {
    planId: 'plan-1',
    taskId: 'task-1',
    taskName: 'T',
    dependsOn: [],
    execution: {},
  })], new Date());

  const result = foldEventsIntoState(state, [
    makeEvent('task_handoff_seen', 2, {
      planId: 'plan-1',
      taskId: 'task-1',
      taskName: 'T',
      handoffContent: 'handoff',
      contentHash: 'a'.repeat(64),
    }),
    makeEvent('task_output_seen', 3, {
      planId: 'plan-1',
      taskId: 'task-1',
      taskName: 'T',
      outputTail: 'output tail',
      contentHash: 'b'.repeat(64),
    }),
  ], new Date());

  assert.equal(result.tasks['task-1']?.handoffSummary, 'handoff');
  assert.equal(result.tasks['task-1']?.outputSummary, 'output tail');
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

// ── New tests from task 008 ────────────────────────────────────────────────────

test('emptyProjectedState includes all new derived-view fields', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  assert.deepEqual(state.worktreeGroups, {});
  assert.deepEqual(state.archivedPlanIds, []);
  assert.deepEqual(state.archivedTaskIds, []);
  assert.deepEqual(state.activeFleet, []);
  assert.deepEqual(state.engineUsage, {});
  assert.deepEqual(state.modelUsage, {});
  assert.deepEqual(state.profileUsage, {});
});

// ── Multi-device observations ─────────────────────────────────────────────────

test('multi-device: two devices track independently in devices map', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const now = new Date();
  const dev1Heartbeat = makeEvent(
    'project_heartbeat',
    1,
    { daemonVersion: '1.0.0', activeTaskCount: 2 },
    { deviceId: 'device-1', occurredAt: now.toISOString() },
  );
  const dev2Heartbeat = makeEvent(
    'project_heartbeat',
    2,
    { daemonVersion: '2.0.0', activeTaskCount: 0 },
    { deviceId: 'device-2', occurredAt: now.toISOString() },
  );
  const result = foldEventsIntoState(state, [dev1Heartbeat, dev2Heartbeat], now);

  assert.ok(result.devices['device-1']);
  assert.ok(result.devices['device-2']);
  assert.equal(result.devices['device-1'].lastHeartbeat?.daemonVersion, '1.0.0');
  assert.equal(result.devices['device-2'].lastHeartbeat?.daemonVersion, '2.0.0');
  // lastEvent should be from device-2 (higher sequence)
  assert.equal(result.lastEvent?.deviceId, 'device-2');
});

test('multi-device: same project worktrees from different devices coexist', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const dev1Worktree = makeEvent(
    'worktree_seen',
    1,
    { worktree: { worktreeId: 'wt-dev1', branch: 'main', groupName: 'device-1', isDirty: false, untrackedCount: 0 } },
    { deviceId: 'device-1' },
  );
  const dev2Worktree = makeEvent(
    'worktree_seen',
    2,
    { worktree: { worktreeId: 'wt-dev2', branch: 'feature', groupName: 'device-2', isDirty: true, untrackedCount: 1 } },
    { deviceId: 'device-2' },
  );
  const result = foldEventsIntoState(state, [dev1Worktree, dev2Worktree], new Date());
  assert.ok(result.worktrees['wt-dev1']);
  assert.ok(result.worktrees['wt-dev2']);
  // Both devices appear
  assert.ok(result.devices['device-1']);
  assert.ok(result.devices['device-2']);
});

// ── Stale devices ─────────────────────────────────────────────────────────────

test('stale device: device with old heartbeat still tracked in devices map', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const staleTime = new Date(Date.now() - HEARTBEAT_STALE_MS - 10_000);
  const freshTime = new Date();

  // Device 1: stale heartbeat
  const staleHb = makeEvent(
    'project_heartbeat',
    1,
    { activeTaskCount: 0 },
    { deviceId: 'device-stale', occurredAt: staleTime.toISOString() },
  );
  // Device 2: fresh heartbeat
  const freshHb = makeEvent(
    'project_heartbeat',
    2,
    { activeTaskCount: 1 },
    { deviceId: 'device-fresh', occurredAt: freshTime.toISOString() },
  );
  const result = foldEventsIntoState(state, [staleHb, freshHb], freshTime);

  // Both devices are still in the map regardless of staleness
  assert.ok(result.devices['device-stale']);
  assert.ok(result.devices['device-fresh']);
  assert.equal(result.devices['device-stale'].lastHeartbeat?.occurredAt, staleTime.toISOString());
  // Project-level dirty is false because device-fresh has a recent heartbeat
  assert.equal(result.dirty, false);
});

test('stale device: no active fleet entry when heartbeat is zero activeTaskCount', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const now = new Date();
  const event = makeEvent(
    'project_heartbeat',
    1,
    { activeTaskCount: 0 },
    { occurredAt: now.toISOString() },
  );
  const result = foldEventsIntoState(state, [event], now);
  assert.deepEqual(result.activeFleet, []);
});

// ── Dirty/diverged worktrees ──────────────────────────────────────────────────

test('dirty worktree is reflected in worktrees map', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const event = makeEvent('worktree_seen', 1, {
    worktree: {
      worktreeId: 'wt-dirty',
      branch: 'feature/x',
      isDirty: true,
      untrackedCount: 5,
      aheadCount: 3,
      behindCount: 1,
    },
  });
  const result = foldEventsIntoState(state, [event], new Date());
  const wt = result.worktrees['wt-dirty'];
  assert.ok(wt);
  assert.equal(wt.isDirty, true);
  assert.equal(wt.untrackedCount, 5);
  assert.equal(wt.aheadCount, 3);
  assert.equal(wt.behindCount, 1);
});

test('diverged worktree with branchUpstream fields is preserved', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const event = makeEvent('worktree_seen', 1, {
    worktree: {
      worktreeId: 'wt-diverged',
      branch: 'feature/diverged',
      isDirty: false,
      untrackedCount: 0,
      displayName: 'diverged-feature',
      groupName: 'my-device',
      branchUpstream: {
        trackingBranch: 'origin/feature/diverged',
        aheadCount: 2,
        behindCount: 4,
      },
    },
  });
  const result = foldEventsIntoState(state, [event], new Date());
  const wt = result.worktrees['wt-diverged'];
  assert.equal(wt.branchUpstream?.aheadCount, 2);
  assert.equal(wt.branchUpstream?.behindCount, 4);
  assert.equal(wt.displayName, 'diverged-feature');
});

// ── worktreeGroups derived view ───────────────────────────────────────────────

test('worktreeGroups groups worktrees by groupName', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const events = [
    makeEvent('worktree_seen', 1, { worktree: { worktreeId: 'wt-a', branch: 'main', isDirty: false, untrackedCount: 0, groupName: 'laptop' } }),
    makeEvent('worktree_seen', 2, { worktree: { worktreeId: 'wt-b', branch: 'feat', isDirty: false, untrackedCount: 0, groupName: 'laptop' } }),
    makeEvent('worktree_seen', 3, { worktree: { worktreeId: 'wt-c', branch: 'main', isDirty: false, untrackedCount: 0, groupName: 'server' } }),
  ];
  const result = foldEventsIntoState(state, events, new Date());
  assert.ok(result.worktreeGroups['laptop']);
  assert.ok(result.worktreeGroups['server']);
  assert.ok(result.worktreeGroups['laptop'].includes('wt-a'));
  assert.ok(result.worktreeGroups['laptop'].includes('wt-b'));
  assert.deepEqual(result.worktreeGroups['server'], ['wt-c']);
});

test('worktreeGroups uses "default" when groupName is absent', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const event = makeEvent('worktree_seen', 1, {
    worktree: { worktreeId: 'wt-nogroupname', branch: 'main', isDirty: false, untrackedCount: 0 },
  });
  const result = foldEventsIntoState(state, [event], new Date());
  assert.ok(result.worktreeGroups['default']);
  assert.ok(result.worktreeGroups['default'].includes('wt-nogroupname'));
});

// ── Active fleet ──────────────────────────────────────────────────────────────

test('activeFleet includes device when activeTaskCount > 0', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const now = new Date();
  const event = makeEvent(
    'project_heartbeat',
    1,
    {
      daemonVersion: '1.0.0',
      activePlanId: 'plan-1',
      activeTaskCount: 3,
      device: { deviceName: 'My Laptop', instanceName: 'default' },
    },
    { deviceId: 'device-active', occurredAt: now.toISOString() },
  );
  const result = foldEventsIntoState(state, [event], now);
  assert.equal(result.activeFleet.length, 1);
  assert.equal(result.activeFleet[0].deviceId, 'device-active');
  assert.equal(result.activeFleet[0].activeTaskCount, 3);
  assert.equal(result.activeFleet[0].activePlanId, 'plan-1');
  assert.equal(result.activeFleet[0].deviceName, 'My Laptop');
});

test('activeFleet shows multiple active devices', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const now = new Date();
  const hb1 = makeEvent('project_heartbeat', 1, { activeTaskCount: 2 }, { deviceId: 'd1', occurredAt: now.toISOString() });
  const hb2 = makeEvent('project_heartbeat', 2, { activeTaskCount: 1 }, { deviceId: 'd2', occurredAt: now.toISOString() });
  const hb3 = makeEvent('project_heartbeat', 3, { activeTaskCount: 0 }, { deviceId: 'd3', occurredAt: now.toISOString() });
  const result = foldEventsIntoState(state, [hb1, hb2, hb3], now);
  assert.equal(result.activeFleet.length, 2);
  const ids = result.activeFleet.map((e) => e.deviceId).sort();
  assert.deepEqual(ids, ['d1', 'd2']);
});

// ── Running tasks ─────────────────────────────────────────────────────────────

test('task_started: task status is running and startedAt is captured', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const startedAt = nowIso(-5000);
  const events: CockpitEvent[] = [
    makeEvent('task_seen', 1, {
      planId: 'plan-1', taskId: 'task-run', taskName: 'Run Me', dependsOn: [], execution: {},
    }),
    makeEvent('task_started', 2, {
      planId: 'plan-1', taskId: 'task-run', taskName: 'Run Me', status: 'running', startedAt, execution: {},
    }),
  ];
  const result = foldEventsIntoState(state, events, new Date());
  const task = result.tasks['task-run'];
  assert.ok(task);
  assert.equal(task.status, 'running');
  assert.equal(task.startedAt, startedAt);
});

// ── Archived plans ────────────────────────────────────────────────────────────

test('archived plan appears in archivedPlanIds', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const archiveEvent = makeEvent(
    'plan_seen',
    1,
    {
      planId: 'plan-archived',
      title: 'Old Plan',
      taskCount: 0,
      tasks: [],
      archive: { archiveId: 'arc-1', archivePath: 'archives/arc-1', archivedAt: nowIso(-86_400_000) },
    },
    { source: 'archive' },
  );
  const liveEvent = makeEvent('plan_seen', 2, {
    planId: 'plan-live',
    title: 'Live Plan',
    taskCount: 0,
    tasks: [],
  });
  const result = foldEventsIntoState(state, [archiveEvent, liveEvent], new Date());
  assert.ok(result.archivedPlanIds.includes('plan-archived'), 'plan-archived should be in archivedPlanIds');
  assert.ok(!result.archivedPlanIds.includes('plan-live'), 'plan-live should NOT be in archivedPlanIds');
  assert.ok(result.plans['plan-archived']);
  assert.ok(result.plans['plan-live']);
});

// ── Archived tasks ────────────────────────────────────────────────────────────

test('archived task appears in archivedTaskIds', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const archiveTask = makeEvent(
    'task_seen',
    1,
    {
      planId: 'plan-1',
      taskId: 'task-archived',
      taskName: 'Old Task',
      dependsOn: [],
      execution: {},
      archive: { archiveId: 'arc-1', archivePath: 'archives/arc-1', archivedAt: nowIso(-86_400_000) },
    },
    { source: 'archive' },
  );
  const liveTask = makeEvent('task_seen', 2, {
    planId: 'plan-1', taskId: 'task-live', taskName: 'Live Task', dependsOn: [], execution: {},
  });
  const result = foldEventsIntoState(state, [archiveTask, liveTask], new Date());
  assert.ok(result.archivedTaskIds.includes('task-archived'));
  assert.ok(!result.archivedTaskIds.includes('task-live'));
});

// ── Historical run review (archive metadata with reviewStatus) ─────────────────

test('archived plan carries archive metadata with reviewStatus', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const event = makeEvent(
    'plan_seen',
    1,
    {
      planId: 'plan-reviewed',
      title: 'Reviewed Plan',
      taskCount: 1,
      tasks: [],
      archive: {
        archiveId: 'arc-2',
        archivedAt: nowIso(-7_200_000),
        reviewStatus: 'reviewed',
        reviewNotes: 'All tasks completed successfully.',
        reviewedAt: nowIso(-3_600_000),
        runId: 'run-abc',
      },
    },
    { source: 'archive' },
  );
  const result = foldEventsIntoState(state, [event], new Date());
  const plan = result.plans['plan-reviewed'];
  assert.ok(plan);
  assert.equal(plan.archive?.reviewStatus, 'reviewed');
  assert.equal(plan.archive?.reviewNotes, 'All tasks completed successfully.');
  assert.equal(plan.archive?.runId, 'run-abc');
  assert.ok(result.archivedPlanIds.includes('plan-reviewed'));
});

test('archived task completed event carries costEstimate and archive metadata', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const planEvent = makeEvent('plan_seen', 1, { planId: 'plan-1', title: 'P', taskCount: 1, tasks: [] },
    { source: 'archive' });
  const taskSeen = makeEvent('task_seen', 2, {
    planId: 'plan-1', taskId: 'task-arc', taskName: 'Archived Task', dependsOn: [], execution: { model: 'claude-sonnet-4-5' },
    archive: { archiveId: 'arc-3', archivedAt: nowIso(-3600_000) },
  }, { source: 'archive' });
  const taskCompleted = makeEvent('task_completed', 3, {
    planId: 'plan-1',
    taskId: 'task-arc',
    taskName: 'Archived Task',
    status: 'done',
    completedAt: nowIso(-3600_000),
    retries: 0,
    usage: { inputTokens: 5_000, outputTokens: 2_000 },
    costEstimate: { currency: 'USD', inputCost: 0.015, outputCost: 0.03, totalCost: 0.045 },
    archive: { archiveId: 'arc-3', archivedAt: nowIso(-3600_000) },
  }, { source: 'archive' });
  const result = foldEventsIntoState(state, [planEvent, taskSeen, taskCompleted], new Date());
  const task = result.tasks['task-arc'];
  assert.ok(task);
  assert.equal(task.status, 'done');
  assert.equal(task.costEstimate?.totalCost, 0.045);
  assert.ok(result.archivedTaskIds.includes('task-arc'));
});

// ── Task markdown (detailContent) ─────────────────────────────────────────────

test('task_seen captures detailContent from task.md', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const event = makeEvent('task_seen', 1, {
    planId: 'plan-1',
    taskId: 'task-with-md',
    taskName: 'MD Task',
    dependsOn: [],
    execution: {},
    detailPath: '.pi/tasks/001-example/task.md',
    detailContent: '# Task: Example\n\nDo something useful.',
  });
  const result = foldEventsIntoState(state, [event], new Date());
  const task = result.tasks['task-with-md'];
  assert.ok(task);
  assert.equal(task.detailPath, '.pi/tasks/001-example/task.md');
  assert.equal(task.detailContent, '# Task: Example\n\nDo something useful.');
});

test('task_seen preserves previous detailContent when new event lacks it', () => {
  let state = emptyProjectedState(BASE_PROJECT_ID);
  state = foldEventsIntoState(state, [
    makeEvent('task_seen', 1, {
      planId: 'plan-1', taskId: 'task-md', taskName: 'T', dependsOn: [], execution: {},
      detailContent: 'original content',
    }),
  ], new Date());

  const result = foldEventsIntoState(state, [
    makeEvent('task_seen', 2, {
      planId: 'plan-1', taskId: 'task-md', taskName: 'T updated', dependsOn: [], execution: {},
    }),
  ], new Date());

  // detailContent should carry forward from the first event
  assert.equal(result.tasks['task-md']?.detailContent, 'original content');
});

// ── Handover text ─────────────────────────────────────────────────────────────

test('task_handoff_seen stores handoff text and hash', () => {
  let state = emptyProjectedState(BASE_PROJECT_ID);
  state = foldEventsIntoState(state, [
    makeEvent('task_seen', 1, { planId: 'p', taskId: 't', taskName: 'T', dependsOn: [], execution: {} }),
  ], new Date());

  const hash = 'a'.repeat(64);
  const result = foldEventsIntoState(state, [
    makeEvent('task_handoff_seen', 2, {
      planId: 'p', taskId: 't', taskName: 'T',
      handoffContent: '# Handoff\n\nAll done.',
      contentHash: hash,
    }),
  ], new Date());

  assert.equal(result.tasks['t']?.handoffSummary, '# Handoff\n\nAll done.');
  assert.equal(result.tasks['t']?.handoffContentHash, hash);
});

test('task_handoff_seen updates when hash changes (re-emission)', () => {
  let state = emptyProjectedState(BASE_PROJECT_ID);
  state = foldEventsIntoState(state, [
    makeEvent('task_seen', 1, { planId: 'p', taskId: 't', taskName: 'T', dependsOn: [], execution: {} }),
    makeEvent('task_handoff_seen', 2, {
      planId: 'p', taskId: 't', taskName: 'T',
      handoffContent: 'first version',
      contentHash: 'a'.repeat(64),
    }),
  ], new Date());

  const result = foldEventsIntoState(state, [
    makeEvent('task_handoff_seen', 3, {
      planId: 'p', taskId: 't', taskName: 'T',
      handoffContent: 'updated version',
      contentHash: 'b'.repeat(64),
    }),
  ], new Date());

  assert.equal(result.tasks['t']?.handoffSummary, 'updated version');
  assert.equal(result.tasks['t']?.handoffContentHash, 'b'.repeat(64));
});

// ── Model/profile usage totals ────────────────────────────────────────────────

test('modelUsage aggregates token usage by model', () => {
  let state = emptyProjectedState(BASE_PROJECT_ID);
  // Two tasks with different models
  state = foldEventsIntoState(state, [
    makeEvent('plan_seen', 0, { planId: 'plan-1', title: 'P', taskCount: 2, tasks: [] }),
    makeEvent('task_seen', 1, {
      planId: 'plan-1', taskId: 'task-a', taskName: 'A', dependsOn: [],
      execution: { engine: 'claude', model: 'claude-sonnet-4-5', profile: 'deep' },
    }),
    makeEvent('task_seen', 2, {
      planId: 'plan-1', taskId: 'task-b', taskName: 'B', dependsOn: [],
      execution: { engine: 'claude', model: 'claude-opus-4', profile: 'deep' },
    }),
    makeEvent('task_completed', 3, {
      planId: 'plan-1', taskId: 'task-a', taskName: 'A', status: 'done',
      completedAt: nowIso(), retries: 0,
      usage: { inputTokens: 1_000, outputTokens: 500 },
    }),
    makeEvent('task_completed', 4, {
      planId: 'plan-1', taskId: 'task-b', taskName: 'B', status: 'done',
      completedAt: nowIso(), retries: 0,
      usage: { inputTokens: 2_000, outputTokens: 1_000 },
    }),
  ], new Date());

  assert.equal(state.modelUsage['claude-sonnet-4-5']?.inputTokens, 1_000);
  assert.equal(state.modelUsage['claude-sonnet-4-5']?.outputTokens, 500);
  assert.equal(state.modelUsage['claude-opus-4']?.inputTokens, 2_000);
  assert.equal(state.modelUsage['claude-opus-4']?.outputTokens, 1_000);
});

test('profileUsage aggregates token usage by profile', () => {
  let state = emptyProjectedState(BASE_PROJECT_ID);
  state = foldEventsIntoState(state, [
    makeEvent('plan_seen', 0, { planId: 'plan-1', title: 'P', taskCount: 2, tasks: [] }),
    makeEvent('task_seen', 1, {
      planId: 'plan-1', taskId: 'task-deep', taskName: 'T1', dependsOn: [],
      execution: { model: 'claude-sonnet-4-5', profile: 'deep' },
    }),
    makeEvent('task_seen', 2, {
      planId: 'plan-1', taskId: 'task-light', taskName: 'T2', dependsOn: [],
      execution: { model: 'claude-haiku-4', profile: 'light' },
    }),
    makeEvent('usage_reported', 3, {
      planId: 'plan-1', taskId: 'task-deep',
      usage: { inputTokens: 800, outputTokens: 200 },
    }),
    makeEvent('usage_reported', 4, {
      planId: 'plan-1', taskId: 'task-light',
      usage: { inputTokens: 100, outputTokens: 50 },
    }),
  ], new Date());

  assert.equal(state.profileUsage['deep']?.inputTokens, 800);
  assert.equal(state.profileUsage['deep']?.outputTokens, 200);
  assert.equal(state.profileUsage['light']?.inputTokens, 100);
  assert.equal(state.profileUsage['light']?.outputTokens, 50);
});

test('engineUsage aggregates token usage by engine', () => {
  let state = emptyProjectedState(BASE_PROJECT_ID);
  state = foldEventsIntoState(state, [
    makeEvent('plan_seen', 0, { planId: 'plan-1', title: 'P', taskCount: 1, tasks: [] }),
    makeEvent('task_seen', 1, {
      planId: 'plan-1', taskId: 'task-1', taskName: 'T', dependsOn: [],
      execution: { engine: 'claude', model: 'claude-sonnet-4-5', profile: 'balanced' },
    }),
    makeEvent('usage_reported', 2, {
      planId: 'plan-1', taskId: 'task-1',
      usage: { inputTokens: 300, outputTokens: 150 },
    }),
  ], new Date());

  assert.equal(state.engineUsage['claude']?.inputTokens, 300);
  assert.equal(state.engineUsage['claude']?.outputTokens, 150);
});

// ── Cost estimates ────────────────────────────────────────────────────────────

test('costEstimate from usage_reported is stored on task', () => {
  let state = emptyProjectedState(BASE_PROJECT_ID);
  state = foldEventsIntoState(state, [
    makeEvent('plan_seen', 0, { planId: 'plan-1', title: 'P', taskCount: 1, tasks: [] }),
    makeEvent('task_seen', 1, {
      planId: 'plan-1', taskId: 'task-1', taskName: 'T', dependsOn: [], execution: {},
    }),
  ], new Date());

  const result = foldEventsIntoState(state, [
    makeEvent('usage_reported', 2, {
      planId: 'plan-1', taskId: 'task-1',
      usage: { inputTokens: 5_000, outputTokens: 2_000 },
      costEstimate: { currency: 'USD', inputCost: 0.015, outputCost: 0.03, totalCost: 0.045, pricingSource: 'estimated' },
    }),
  ], new Date());

  assert.equal(result.tasks['task-1']?.costEstimate?.totalCost, 0.045);
  assert.equal(result.tasks['task-1']?.costEstimate?.pricingSource, 'estimated');
  assert.equal(result.plans['plan-1']?.costEstimate?.totalCost, 0.045);
  assert.equal(result.projectCostEstimate?.totalCost, 0.045);
});

test('costEstimate accumulates from task_completed event', () => {
  let state = emptyProjectedState(BASE_PROJECT_ID);
  state = foldEventsIntoState(state, [
    makeEvent('plan_seen', 0, { planId: 'plan-1', title: 'P', taskCount: 2, tasks: [] }),
    makeEvent('task_seen', 1, { planId: 'plan-1', taskId: 't1', taskName: 'T1', dependsOn: [], execution: {} }),
    makeEvent('task_seen', 2, { planId: 'plan-1', taskId: 't2', taskName: 'T2', dependsOn: [], execution: {} }),
    makeEvent('task_completed', 3, {
      planId: 'plan-1', taskId: 't1', taskName: 'T1', status: 'done', completedAt: nowIso(), retries: 0,
      costEstimate: { currency: 'USD', inputCost: 0.01, outputCost: 0.02, totalCost: 0.03 },
    }),
    makeEvent('task_completed', 4, {
      planId: 'plan-1', taskId: 't2', taskName: 'T2', status: 'done', completedAt: nowIso(), retries: 0,
      costEstimate: { currency: 'USD', inputCost: 0.005, outputCost: 0.01, totalCost: 0.015 },
    }),
  ], new Date());

  // Plan cost should be sum of both tasks
  assert.ok(Math.abs((state.plans['plan-1']?.costEstimate?.totalCost ?? 0) - 0.045) < 0.0001);
  assert.ok(Math.abs((state.projectCostEstimate?.totalCost ?? 0) - 0.045) < 0.0001);
});

// ── Old v1 events (backward compatibility) ────────────────────────────────────

test('schema version 1 project_seen event is processed without errors', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const v1Event: CockpitEvent = {
    schemaVersion: 1,
    eventId: 'evt-v1-1',
    sequence: 1,
    occurredAt: new Date().toISOString(),
    source: 'live',
    projectId: BASE_PROJECT_ID,
    deviceId: BASE_DEVICE_ID,
    type: 'project_seen',
    payload: {
      projectName: 'V1 Project',
      telemetry: {
        worktreePath: 'relative',
        repoRootPath: 'off',
        git: 'full',
        progressText: false,
        usage: true,
        planText: true,
        taskDescription: true,
      },
    },
  };
  const result = foldEventsIntoState(state, [v1Event], new Date());
  assert.equal(result.projectName, 'V1 Project');
  assert.equal(result.schemaVersion, cockpitProtocolSchemaVersion);
});

test('schema version 1 task lifecycle events are processed correctly', () => {
  const state = emptyProjectedState(BASE_PROJECT_ID);
  const v1 = (type: CockpitEvent['type'], seq: number, payload: CockpitEvent['payload']): CockpitEvent =>
    ({
      schemaVersion: 1 as const,
      eventId: `evt-v1-${seq}`,
      sequence: seq,
      occurredAt: new Date().toISOString(),
      source: 'live',
      projectId: BASE_PROJECT_ID,
      deviceId: BASE_DEVICE_ID,
      type,
      payload,
    }) as CockpitEvent;

  const events: CockpitEvent[] = [
    v1('plan_seen', 1, { planId: 'plan-v1', title: 'V1 Plan', taskCount: 1, tasks: [] }),
    v1('task_seen', 2, { planId: 'plan-v1', taskId: 'task-v1', taskName: 'V1 Task', dependsOn: [], execution: {} }),
    v1('task_started', 3, { planId: 'plan-v1', taskId: 'task-v1', taskName: 'V1 Task', status: 'running', startedAt: new Date().toISOString(), execution: {} }),
    v1('task_completed', 4, { planId: 'plan-v1', taskId: 'task-v1', taskName: 'V1 Task', status: 'done', completedAt: new Date().toISOString(), retries: 0 }),
  ];
  const result = foldEventsIntoState(state, events, new Date());
  assert.equal(result.tasks['task-v1']?.status, 'done');
  assert.ok(result.plans['plan-v1']);
});

// ── Recovery from empty state (simulates checkpoint recovery) ─────────────────

test('full replay from empty state produces correct result after checkpoint loss', () => {
  // This simulates recovering from a corrupted checkpoint by replaying all events
  const now = new Date();
  const events: CockpitEvent[] = [
    makeEvent('project_seen', 1, {
      projectName: 'Recovery Test',
      telemetry: { worktreePath: 'relative', repoRootPath: 'off', git: 'full', progressText: false, usage: true, planText: true, taskDescription: true },
    }, { occurredAt: now.toISOString() }),
    makeEvent('worktree_seen', 2, {
      worktree: { worktreeId: 'wt-1', branch: 'main', isDirty: false, untrackedCount: 0, groupName: 'laptop' },
    }, { occurredAt: now.toISOString() }),
    makeEvent('plan_seen', 3, { planId: 'plan-1', title: 'My Plan', taskCount: 1, tasks: [] }, { occurredAt: now.toISOString() }),
    makeEvent('task_seen', 4, {
      planId: 'plan-1', taskId: 'task-1', taskName: 'Task One', dependsOn: [],
      execution: { engine: 'claude', model: 'claude-sonnet-4-5', profile: 'deep' },
    }, { occurredAt: now.toISOString() }),
    makeEvent('usage_reported', 5, {
      planId: 'plan-1', taskId: 'task-1',
      usage: { inputTokens: 1_000, outputTokens: 500 },
      costEstimate: { currency: 'USD', inputCost: 0.003, outputCost: 0.0075, totalCost: 0.0105 },
    }, { occurredAt: now.toISOString() }),
  ];

  // First pass: build state incrementally
  let state = emptyProjectedState(BASE_PROJECT_ID);
  state = foldEventsIntoState(state, events, now);

  // Second pass: replay from empty (simulates checkpoint recovery)
  const recovered = foldEventsIntoState(emptyProjectedState(BASE_PROJECT_ID), events, now);

  // Both should be identical
  assert.equal(recovered.projectName, state.projectName);
  assert.deepEqual(recovered.worktrees, state.worktrees);
  assert.deepEqual(recovered.worktreeGroups, state.worktreeGroups);
  assert.deepEqual(recovered.modelUsage, state.modelUsage);
  assert.deepEqual(recovered.projectCostEstimate, state.projectCostEstimate);
});
