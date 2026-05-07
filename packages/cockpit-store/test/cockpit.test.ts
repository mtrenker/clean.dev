import test from 'node:test';
import assert from 'node:assert/strict';

import type { CockpitEvent } from '@cleandev/cockpit-protocol';

import { summarizeProjectsFromEvents } from '../src/repository';

test('summarizeProjectsFromEvents keeps the latest per-project metadata from protocol events', () => {
  const events: CockpitEvent[] = [
    {
      schemaVersion: 1,
      eventId: 'evt-1',
      sequence: 3,
      occurredAt: '2026-05-05T20:00:00.000Z',
      source: 'live',
      projectId: 'project-a',
      deviceId: 'device-a',
      type: 'project_heartbeat',
      payload: {
        daemonVersion: '1.0.0',
        activePlanId: 'plan-a',
        activeTaskCount: 1,
      },
    },
    {
      schemaVersion: 1,
      eventId: 'evt-2',
      sequence: 5,
      occurredAt: '2026-05-05T20:01:00.000Z',
      source: 'live',
      projectId: 'project-a',
      deviceId: 'device-a',
      type: 'project_seen',
      payload: {
        projectName: 'Clean Dev',
        telemetry: {
          worktreePath: 'relative',
          repoRootPath: 'off',
          git: 'full',
          progressText: false,
          usage: true,
          planText: true,
          taskDescription: true,
        },
        localRootPath: '.',
      },
    },
    {
      schemaVersion: 1,
      eventId: 'evt-3',
      sequence: 2,
      occurredAt: '2026-05-05T20:02:00.000Z',
      source: 'archive',
      projectId: 'project-b',
      deviceId: 'device-b',
      type: 'project_seen',
      payload: {
        projectName: 'Archive Project',
        telemetry: {
          worktreePath: 'off',
          repoRootPath: 'off',
          git: 'branch-only',
          progressText: false,
          usage: true,
          planText: false,
          taskDescription: false,
        },
        localRootPath: '/tmp/archive',
      },
    },
  ];

  const summaries = summarizeProjectsFromEvents(events);

  assert.equal(summaries.length, 2);
  assert.deepEqual(summaries.find((summary) => summary.projectId === 'project-a'), {
    projectId: 'project-a',
    latestEventId: 'evt-2',
    latestSequence: 5,
    latestOccurredAt: '2026-05-05T20:01:00.000Z',
    projectName: 'Clean Dev',
    localRootPath: '.',
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
  assert.equal(summaries.find((summary) => summary.projectId === 'project-b')?.latestEventId, 'evt-3');
});
