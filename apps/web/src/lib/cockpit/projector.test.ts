// @vitest-environment node
/**
 * Unit / integration tests for CockpitProjector.
 *
 * All tests use a fully-typed in-memory mock of ICockpitRepository so there
 * is no database dependency.
 *
 * Coverage goals:
 *   - projects within the debounce window are skipped
 *   - projects past the debounce window are projected
 *   - fold result is persisted via upsertProjectedProjectState
 *   - state.dirty reflects daemon staleness after projection
 *   - errors in one project do not prevent others from being projected
 *   - start() / stop() manage the polling timer
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cockpitProtocolSchemaVersion } from '@cleandev/cockpit-protocol';
import type { CockpitEvent, EventBatchAck } from '@cleandev/cockpit-protocol';
import type { ICockpitRepository } from '@cleandev/cockpit-store';
import type {
  CockpitDeviceSessionRecord,
  CockpitDeviceTokenRecord,
  CockpitPairedDeviceRecord,
  CockpitProjectRecord,
  CockpitProjectedProjectState,
  CockpitProjectedProjectStateRecord,
  UpsertProjectedProjectStateInput,
} from '@cleandev/cockpit-store';

import {
  CockpitProjector,
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_POLL_INTERVAL_MS,
} from './projector';

// ── Mock helpers ───────────────────────────────────────────────────────────────

const NOW = new Date('2026-05-05T12:00:00.000Z');

/**
 * A project record that has been dirty for longer than the default debounce
 * window, so it will be returned by `listDirtyProjects`.
 */
function makeProjectRecord(
  projectId: string,
  overrides: Partial<CockpitProjectRecord> = {},
): CockpitProjectRecord {
  return {
    projectId,
    projectSlug: null,
    projectName: null,
    localRootPath: null,
    telemetry: null,
    latestEventSequence: 0,
    latestEventAt: null,
    projectionDirty: true,
    dirtyMarkedAt: new Date(NOW.getTime() - DEFAULT_DEBOUNCE_MS - 1000),
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function makeProjectedStateRecord(
  projectId: string,
  latestEventSequence = 0,
  state?: Partial<CockpitProjectedProjectState>,
): CockpitProjectedProjectStateRecord {
  const fullState: CockpitProjectedProjectState = {
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
    ...(state ?? {}),
  };
  return {
    projectId,
    schemaVersion: cockpitProtocolSchemaVersion,
    latestEventId: null,
    latestEventSequence,
    dirty: true,
    projectedAt: NOW,
    state: fullState,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function makeHeartbeatEvent(
  projectId: string,
  sequence: number,
  occurredAt: Date,
): CockpitEvent {
  return {
    schemaVersion: cockpitProtocolSchemaVersion,
    eventId: `evt-hb-${sequence}`,
    sequence,
    occurredAt: occurredAt.toISOString(),
    source: 'live',
    projectId,
    deviceId: 'device-1',
    type: 'project_heartbeat',
    payload: { activeTaskCount: 0 },
  };
}

function makeProjectSeenEvent(projectId: string, sequence: number): CockpitEvent {
  return {
    schemaVersion: cockpitProtocolSchemaVersion,
    eventId: `evt-ps-${sequence}`,
    sequence,
    occurredAt: NOW.toISOString(),
    source: 'live',
    projectId,
    deviceId: 'device-1',
    type: 'project_seen',
    payload: {
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
}

type MockRepo = ICockpitRepository & {
  _upsertCalls: UpsertProjectedProjectStateInput[];
};

function makeMockRepo(overrides: Partial<ICockpitRepository> = {}): MockRepo {
  const upsertCalls: UpsertProjectedProjectStateInput[] = [];

  const base: ICockpitRepository = {
    createProject: vi.fn(),
    listProjects: vi.fn().mockResolvedValue([]),
    createDevice: vi.fn(),
    listDevices: vi.fn().mockResolvedValue([]),
    revokeDevice: vi.fn(),
    createDevicePairing: vi.fn(),
    findDevicePairingByUserCode: vi.fn().mockResolvedValue(null),
    listPendingDevicePairings: vi.fn().mockResolvedValue([]),
    approveDevicePairing: vi.fn(),
    exchangeDevicePairing: vi.fn(),
    createSession: vi.fn(),
    touchSession: vi.fn(),
    findActiveTokenByHash: vi.fn().mockResolvedValue(null),
    insertEventBatch: vi.fn().mockResolvedValue({} as EventBatchAck),
    markProjectDirty: vi.fn(),
    getProjectedProjectState: vi.fn().mockResolvedValue(null),
    getProjectedProjectStateRecord: vi.fn().mockResolvedValue(null),
    upsertProjectedProjectState: vi.fn().mockImplementation(
      async (input: UpsertProjectedProjectStateInput) => {
        upsertCalls.push(input);
        return makeProjectedStateRecord(input.projectId, input.latestEventSequence);
      },
    ),
    pruneRawEvents: vi.fn(),
    listDirtyProjects: vi.fn().mockResolvedValue([]),
    listRawEventsSince: vi.fn().mockResolvedValue([]),
    ...overrides,
  };

  return Object.assign(base, { _upsertCalls: upsertCalls });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('CockpitProjector', () => {
  // ── projectAll ────────────────────────────────────────────────────────────────

  describe('projectAll()', () => {
    it('returns { projected: 0, skipped: 0 } when there are no dirty projects', async () => {
      const repo = makeMockRepo();
      const projector = new CockpitProjector(repo);
      const result = await projector.projectAll();
      expect(result).toEqual({ projected: 0, skipped: 0 });
      expect(repo.upsertProjectedProjectState).not.toHaveBeenCalled();
    });

    it('skips projects still within the debounce window', async () => {
      // listDirtyProjects returns [] when minDirtyAgeMs filters everything out;
      // we simulate this by returning nothing from the mock.
      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([]),
      });
      const projector = new CockpitProjector(repo, { debounceMs: 5_000 });
      const result = await projector.projectAll();
      expect(result.projected).toBe(0);
    });

    it('projects a single dirty project past the debounce window', async () => {
      const projectId = 'proj-1';
      const event = makeProjectSeenEvent(projectId, 1);

      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([makeProjectRecord(projectId)]),
        listRawEventsSince: vi.fn().mockResolvedValue([event]),
      });

      const projector = new CockpitProjector(repo);
      const result = await projector.projectAll();

      expect(result).toEqual({ projected: 1, skipped: 0 });
      expect(repo.upsertProjectedProjectState).toHaveBeenCalledOnce();
    });

    it('passes debounceMs to listDirtyProjects', async () => {
      const repo = makeMockRepo();
      const projector = new CockpitProjector(repo, { debounceMs: 7_000 });
      await projector.projectAll();
      expect(repo.listDirtyProjects).toHaveBeenCalledWith(7_000);
    });

    it('projects multiple dirty projects in one cycle', async () => {
      const p1 = makeProjectRecord('proj-1');
      const p2 = makeProjectRecord('proj-2');

      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([p1, p2]),
        listRawEventsSince: vi.fn().mockResolvedValue([]),
      });
      const projector = new CockpitProjector(repo);
      const result = await projector.projectAll();

      expect(result).toEqual({ projected: 2, skipped: 0 });
      expect(repo.upsertProjectedProjectState).toHaveBeenCalledTimes(2);
    });

    it('counts projects that throw as skipped and continues with the rest', async () => {
      const p1 = makeProjectRecord('proj-throws');
      const p2 = makeProjectRecord('proj-ok');

      let callCount = 0;
      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([p1, p2]),
        listRawEventsSince: vi.fn().mockImplementation(async () => {
          callCount++;
          if (callCount === 1) throw new Error('DB is down');
          return [];
        }),
      });
      const projector = new CockpitProjector(repo);
      const result = await projector.projectAll();

      expect(result).toEqual({ projected: 1, skipped: 1 });
      // proj-ok should still have been projected
      expect(repo.upsertProjectedProjectState).toHaveBeenCalledOnce();
      const call = (repo as MockRepo)._upsertCalls[0];
      expect(call.projectId).toBe('proj-ok');
    });
  });

  // ── Event folding ─────────────────────────────────────────────────────────────

  describe('event folding', () => {
    it('folds new events onto an existing state', async () => {
      const projectId = 'proj-fold';
      const existingRecord = makeProjectedStateRecord(projectId, 3);

      const newEvent = makeProjectSeenEvent(projectId, 4);
      newEvent.payload = {
        projectName: 'Folded Project',
        localRootPath: '/path',
        telemetry: {
          worktreePath: 'relative',
          repoRootPath: 'off',
          git: 'full',
          progressText: false,
          usage: true,
          planText: true,
          taskDescription: true,
        },
      };

      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([makeProjectRecord(projectId)]),
        getProjectedProjectStateRecord: vi.fn().mockResolvedValue(existingRecord),
        listRawEventsSince: vi.fn().mockResolvedValue([newEvent]),
      });

      const projector = new CockpitProjector(repo);
      await projector.projectAll();

      expect(repo.listRawEventsSince).toHaveBeenCalledWith(projectId, 3, 10_000);

      const call = (repo as MockRepo)._upsertCalls[0];
      expect(call.latestEventSequence).toBe(4);
      expect(call.state.projectName).toBe('Folded Project');
    });

    it('uses sequence 0 as the starting point when there is no existing record', async () => {
      const projectId = 'proj-new';
      const event = makeProjectSeenEvent(projectId, 1);

      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([makeProjectRecord(projectId)]),
        getProjectedProjectStateRecord: vi.fn().mockResolvedValue(null),
        listRawEventsSince: vi.fn().mockResolvedValue([event]),
      });

      const projector = new CockpitProjector(repo);
      await projector.projectAll();

      expect(repo.listRawEventsSince).toHaveBeenCalledWith(projectId, 0, 10_000);
    });

    it('recovers early empty projections whose checkpoint skipped the raw backlog', async () => {
      const projectId = 'proj-recover';
      const existingRecord = makeProjectedStateRecord(projectId, 99, {
        lastEvent: {
          eventId: 'evt-old',
          sequence: 99,
          occurredAt: NOW.toISOString(),
          type: 'usage_reported',
          deviceId: 'device-1',
          sessionId: null,
          runId: null,
          source: 'live',
        },
      });
      const event = makeProjectSeenEvent(projectId, 1);

      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([makeProjectRecord(projectId)]),
        getProjectedProjectStateRecord: vi.fn().mockResolvedValue(existingRecord),
        listRawEventsSince: vi.fn().mockResolvedValue([event]),
      });

      const projector = new CockpitProjector(repo);
      await projector.projectAll();

      expect(repo.listRawEventsSince).toHaveBeenCalledWith(projectId, 0, 10_000);
    });

    it('keeps latestEventSequence from existing record when no new events arrive', async () => {
      const projectId = 'proj-noevents';
      const existingRecord = makeProjectedStateRecord(projectId, 7);

      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([makeProjectRecord(projectId)]),
        getProjectedProjectStateRecord: vi.fn().mockResolvedValue(existingRecord),
        listRawEventsSince: vi.fn().mockResolvedValue([]),
      });

      const projector = new CockpitProjector(repo);
      await projector.projectAll();

      const call = (repo as MockRepo)._upsertCalls[0];
      expect(call.latestEventSequence).toBe(7);
    });
  });

  // ── Staleness detection ───────────────────────────────────────────────────────

  describe('heartbeat staleness', () => {
    it('sets state.dirty=false when heartbeat is fresh (within heartbeatStaleMs)', async () => {
      const projectId = 'proj-fresh';
      const freshHeartbeatTime = NOW; // same as now → not stale

      const event = makeHeartbeatEvent(projectId, 1, freshHeartbeatTime);

      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([makeProjectRecord(projectId)]),
        getProjectedProjectStateRecord: vi.fn().mockResolvedValue(null),
        listRawEventsSince: vi.fn().mockResolvedValue([event]),
      });

      // We need to control `new Date()` inside projectOne; use a spy approach:
      // inject heartbeatStaleMs large enough that NOW is always fresh.
      const projector = new CockpitProjector(repo, {
        heartbeatStaleMs: 60_000,
      });

      // Fake time so "now" === the heartbeat time
      vi.useFakeTimers();
      vi.setSystemTime(NOW);

      try {
        await projector.projectAll();
      } finally {
        vi.useRealTimers();
      }

      const call = (repo as MockRepo)._upsertCalls[0];
      expect(call.state.dirty).toBe(false);
    });

    it('sets state.dirty=true when heartbeat is stale (older than heartbeatStaleMs)', async () => {
      const projectId = 'proj-stale';
      const staleHeartbeatTime = new Date(NOW.getTime() - 90_000); // 90 s ago

      const event = makeHeartbeatEvent(projectId, 1, staleHeartbeatTime);

      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([makeProjectRecord(projectId)]),
        getProjectedProjectStateRecord: vi.fn().mockResolvedValue(null),
        listRawEventsSince: vi.fn().mockResolvedValue([event]),
      });

      vi.useFakeTimers();
      vi.setSystemTime(NOW);

      const projector = new CockpitProjector(repo, { heartbeatStaleMs: 60_000 });

      try {
        await projector.projectAll();
      } finally {
        vi.useRealTimers();
      }

      const call = (repo as MockRepo)._upsertCalls[0];
      expect(call.state.dirty).toBe(true);
    });

    it('sets state.dirty=true when there is no heartbeat and no recent events', async () => {
      const projectId = 'proj-no-hb';
      // Event occurred 120 s ago – no heartbeat
      const oldEvent = makeProjectSeenEvent(projectId, 1);
      oldEvent.occurredAt = new Date(NOW.getTime() - 120_000).toISOString();

      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([makeProjectRecord(projectId)]),
        getProjectedProjectStateRecord: vi.fn().mockResolvedValue(null),
        listRawEventsSince: vi.fn().mockResolvedValue([oldEvent]),
      });

      vi.useFakeTimers();
      vi.setSystemTime(NOW);

      const projector = new CockpitProjector(repo, { heartbeatStaleMs: 60_000 });

      try {
        await projector.projectAll();
      } finally {
        vi.useRealTimers();
      }

      const call = (repo as MockRepo)._upsertCalls[0];
      expect(call.state.dirty).toBe(true);
    });
  });

  // ── start / stop ──────────────────────────────────────────────────────────────

  describe('start() / stop()', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('isRunning is false before start()', () => {
      const repo = makeMockRepo();
      const projector = new CockpitProjector(repo);
      expect(projector.isRunning).toBe(false);
    });

    it('isRunning is true after start()', () => {
      const repo = makeMockRepo();
      const projector = new CockpitProjector(repo);
      projector.start();
      expect(projector.isRunning).toBe(true);
      projector.stop();
    });

    it('isRunning is false after stop()', () => {
      const repo = makeMockRepo();
      const projector = new CockpitProjector(repo);
      projector.start();
      projector.stop();
      expect(projector.isRunning).toBe(false);
    });

    it('start() is idempotent (calling twice does not create two timers)', async () => {
      const repo = makeMockRepo();
      const projector = new CockpitProjector(repo);
      projector.start(DEFAULT_POLL_INTERVAL_MS);
      projector.start(DEFAULT_POLL_INTERVAL_MS); // second call – no-op
      expect(projector.isRunning).toBe(true);

      // Advance one tick and check projectAll was called exactly once
      await vi.advanceTimersByTimeAsync(DEFAULT_POLL_INTERVAL_MS + 1);
      expect(repo.listDirtyProjects).toHaveBeenCalledOnce();
      projector.stop();
    });

    it('stop() is safe to call when already stopped', () => {
      const repo = makeMockRepo();
      const projector = new CockpitProjector(repo);
      expect(() => projector.stop()).not.toThrow();
    });

    it('calls projectAll on each poll interval', async () => {
      const repo = makeMockRepo();
      const projector = new CockpitProjector(repo);
      projector.start(100);

      await vi.advanceTimersByTimeAsync(350);
      // Should have fired at 100ms, 200ms, 300ms → 3 calls
      expect(repo.listDirtyProjects).toHaveBeenCalledTimes(3);

      projector.stop();
    });
  });

  // ── Determinism ───────────────────────────────────────────────────────────────

  describe('determinism', () => {
    it('produces the same snapshot when the same events are projected twice', async () => {
      const projectId = 'proj-det';
      const events: CockpitEvent[] = [
        makeProjectSeenEvent(projectId, 1),
        makeHeartbeatEvent(projectId, 2, NOW),
      ];

      const repo = makeMockRepo({
        listDirtyProjects: vi.fn().mockResolvedValue([makeProjectRecord(projectId)]),
        getProjectedProjectStateRecord: vi.fn().mockResolvedValue(null),
        listRawEventsSince: vi.fn().mockResolvedValue(events),
      });

      vi.useFakeTimers();
      vi.setSystemTime(NOW);

      const projector = new CockpitProjector(repo);

      try {
        await projector.projectAll();
        const firstState = (repo as MockRepo)._upsertCalls[0]?.state;

        // Simulate second projection with the same events
        (repo.getProjectedProjectStateRecord as ReturnType<typeof vi.fn>).mockResolvedValue(
          makeProjectedStateRecord(projectId, 0, firstState),
        );
        await projector.projectAll();
        const secondState = (repo as MockRepo)._upsertCalls[1]?.state;

        expect(secondState).toEqual(firstState);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
