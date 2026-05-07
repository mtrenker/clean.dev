import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import type { EventBatchAck, MappedProject } from '@cleandev/cockpit-protocol';
import { afterEach, describe, expect, it } from 'vitest';

import { openLocalDaemonDb, hashSnapshot } from './local-db';
import { resolveDaemonPaths } from './config';

const tempDirs: string[] = [];

afterEach(async () => {
  for (const dir of tempDirs.splice(0, tempDirs.length)) {
    await rm(dir, { recursive: true, force: true });
  }
});

const createTestProject = (localRootPath: string): MappedProject => ({
  projectId: 'project-1',
  localRootPath,
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

const createProgressEvent = (eventId: string, occurredAt: string) => ({
  schemaVersion: 1 as const,
  eventId,
  occurredAt,
  source: 'live' as const,
  projectId: 'project-1',
  deviceId: 'device-1',
  sessionId: 'session-1',
  runId: 'run-1',
  type: 'task_progressed' as const,
  payload: {
    planId: 'plan-1',
    taskId: 'task-1',
    taskName: 'Implement daemon persistence',
    progressStatus: 'running' as const,
    step: 'Persisted a progress line',
    progressVisible: true,
    progressAt: occurredAt,
    latestProgressAt: occurredAt,
  },
});

const createAck = (sequence: number): EventBatchAck => ({
  batchId: 'batch-1',
  ackedThroughSequence: sequence,
  acceptedCount: 1,
  duplicateCount: 0,
  rejected: [],
  serverTime: '2026-05-05T22:20:00.000Z',
});

describe('local daemon sqlite state', () => {
  it('persists configured project mappings and resume state', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cockpit-daemon-db-'));
    tempDirs.push(root);
    const paths = resolveDaemonPaths(path.join(root, 'daemon-config.json'));
    const db = await openLocalDaemonDb(paths);

    try {
      db.syncConfiguredProjects([createTestProject(path.join(root, 'repo'))]);

      const state = db.getState();
      const projects = db.listConfiguredProjects();

      expect(state.configuredProjectCount).toBe(1);
      expect(state.lastAckedSequence).toBe(0);
      expect(projects[0]?.projectId).toBe('project-1');
    } finally {
      db.close();
    }
  });

  it('reuses the same queued event across restarts while offline', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cockpit-daemon-db-'));
    tempDirs.push(root);
    const paths = resolveDaemonPaths(path.join(root, 'daemon-config.json'));
    const sourceFile = path.join(root, '.pi', 'tasks', '009', 'progress.jsonl');
    const snapshotHash = hashSnapshot('{"step":"Persisted a progress line","status":"running"}');
    const draft = createProgressEvent('evt-1', '2026-05-05T22:18:00.000Z');

    {
      const db = await openLocalDaemonDb(paths);
      try {
        db.syncConfiguredProjects([createTestProject(path.join(root, 'repo'))]);
        const queued = db.queueEvent({
          event: draft,
          source: {
            filePath: sourceFile,
            offset: 64,
            snapshotHash,
          },
        });

        expect(queued.sequence).toBe(1);
        expect(db.listPendingOutboundEvents()).toHaveLength(1);
      } finally {
        db.close();
      }
    }

    {
      const db = await openLocalDaemonDb(paths);
      try {
        const replayed = db.queueEvent({
          event: {
            ...draft,
            eventId: 'evt-2',
            occurredAt: '2026-05-05T22:19:00.000Z',
          },
          source: {
            filePath: sourceFile,
            offset: 64,
            snapshotHash,
          },
        });

        expect(replayed.sequence).toBe(1);
        expect(replayed.eventId).toBe('evt-1');
        expect(db.listPendingOutboundEvents()).toHaveLength(1);
      } finally {
        db.close();
      }
    }
  });

  it('does not regenerate already-acked progress events after restart', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cockpit-daemon-db-'));
    tempDirs.push(root);
    const paths = resolveDaemonPaths(path.join(root, 'daemon-config.json'));
    const sourceFile = path.join(root, '.pi', 'tasks', '009', 'progress.jsonl');
    const snapshotHash = hashSnapshot('{"step":"Persisted a progress line","status":"done"}');
    const draft = createProgressEvent('evt-1', '2026-05-05T22:18:00.000Z');

    {
      const db = await openLocalDaemonDb(paths);
      try {
        db.syncConfiguredProjects([createTestProject(path.join(root, 'repo'))]);
        const queued = db.queueEvent({
          event: draft,
          source: {
            filePath: sourceFile,
            offset: 128,
            snapshotHash,
          },
        });

        db.acknowledgeBatch(createAck(queued.sequence));

        const observed = db.getObservedFile('project-1', sourceFile);
        const state = db.getState();

        expect(observed?.byteOffset).toBe(128);
        expect(observed?.snapshotHash).toBe(snapshotHash);
        expect(state.lastAckedSequence).toBe(1);
        expect(db.listPendingOutboundEvents()).toHaveLength(0);
      } finally {
        db.close();
      }
    }

    {
      const db = await openLocalDaemonDb(paths);
      try {
        const replayed = db.queueEvent({
          event: {
            ...draft,
            eventId: 'evt-2',
            occurredAt: '2026-05-05T22:21:00.000Z',
          },
          source: {
            filePath: sourceFile,
            offset: 128,
            snapshotHash,
          },
        });

        const state = db.getState();

        expect(replayed.sequence).toBe(1);
        expect(replayed.eventId).toBe('evt-1');
        expect(state.lastAckedSequence).toBe(1);
        expect(state.nextSequence).toBe(2);
        expect(db.listPendingOutboundEvents()).toHaveLength(0);
      } finally {
        db.close();
      }
    }
  });
});
