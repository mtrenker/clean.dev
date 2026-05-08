import { describe, expect, it } from 'vitest';

import { cockpitProtocolSchemaVersion, daemonConfigSchema, telemetryProfilePresets } from './config';
import { cockpitEventSchema } from './events';
import { cockpitClientMessageSchema, cockpitServerMessageSchema } from './messages';

describe('@cleandev/cockpit-protocol', () => {
  it('parses daemon config with balanced telemetry defaults', () => {
    const parsed = daemonConfigSchema.parse({
      schemaVersion: cockpitProtocolSchemaVersion,
      serverUrl: 'https://clean.dev',
      projects: [
        {
          projectId: 'proj_123',
          localRootPath: './repo',
        },
      ],
    });

    expect(parsed.instanceName).toBe('default');
    expect(parsed.projects[0]?.telemetry).toEqual(telemetryProfilePresets.balanced);
    expect(parsed.projects[0]?.observation.worktrees.groupBy).toBe('branch');
  });

  it('accepts a redacted task progress event and event batch message', () => {
    const event = cockpitEventSchema.parse({
      schemaVersion: 1,
      eventId: 'evt_1',
      sequence: 7,
      occurredAt: '2026-05-05T20:00:00.000Z',
      source: 'live',
      projectId: 'project_1',
      deviceId: 'device_1',
      type: 'task_progressed',
      payload: {
        planId: 'plan_1',
        taskId: '002',
        taskName: 'Add shared cockpit protocol package',
        progressStatus: 'running',
        step: null,
        progressVisible: false,
        progressAt: '2026-05-05T20:00:00.000Z',
      },
    });

    const message = cockpitClientMessageSchema.parse({
      type: 'event_batch',
      schemaVersion: 1,
      payload: {
        batchId: 'batch_1',
        sentAt: '2026-05-05T20:00:01.000Z',
        events: [event],
      },
    });

    expect(message.type).toBe('event_batch');
    if (message.type !== 'event_batch') {
      throw new Error('expected event_batch message');
    }

    expect(message.payload.events).toHaveLength(1);
    expect(message.payload.events[0]?.type).toBe('task_progressed');
  });

  it('accepts server acknowledgements with duplicate and rejected accounting', () => {
    const message = cockpitServerMessageSchema.parse({
      type: 'event_batch_ack',
      schemaVersion: 1,
      payload: {
        batchId: 'batch_1',
        ackedThroughSequence: 9,
        acceptedCount: 2,
        duplicateCount: 1,
        rejected: [
          {
            eventId: 'evt_3',
            sequence: 10,
            reason: 'project_not_found',
          },
        ],
        serverTime: '2026-05-05T20:00:02.000Z',
      },
    });

    expect(message.type).toBe('event_batch_ack');
    if (message.type !== 'event_batch_ack') {
      throw new Error('expected event_batch_ack message');
    }

    expect(message.payload.ackedThroughSequence).toBe(9);
    expect(message.payload.rejected[0]?.reason).toBe('project_not_found');
  });

  it('accepts v2 project observation, worktree grouping, and device metadata fields', () => {
    const event = cockpitEventSchema.parse({
      schemaVersion: cockpitProtocolSchemaVersion,
      eventId: 'evt_2',
      sequence: 8,
      occurredAt: '2026-05-05T20:00:00.000Z',
      source: 'live',
      projectId: 'project_1',
      deviceId: 'device_1',
      type: 'project_seen',
      payload: {
        projectName: 'Clean.dev',
        localRootPath: './repo',
        worktreeRootPath: './worktrees',
        telemetry: telemetryProfilePresets.balanced,
        observation: {
          alias: 'Primary repo',
          staleAfterMs: 45000,
          includeArchived: true,
          worktrees: {
            nameTemplate: '{branch}@{device}',
            groupBy: 'device',
            groupNameTemplate: '{device}',
          },
        },
      },
    });

    const heartbeat = cockpitClientMessageSchema.parse({
      type: 'client_heartbeat',
      schemaVersion: cockpitProtocolSchemaVersion,
      sentAt: '2026-05-05T20:00:01.000Z',
      latestSequence: 8,
      activeProjectIds: ['project_1'],
      deviceMetadata: {
        deviceName: 'Martin Laptop',
        instanceName: 'default',
        hostname: 'martin-mbp',
        platform: 'darwin',
        appVersion: '0.2.0',
      },
      usage: {
        inputTokens: 3,
        outputTokens: 5,
      },
      costEstimate: {
        currency: 'USD',
        inputCost: 0.01,
        outputCost: 0.02,
        totalCost: 0.03,
      },
    });

    expect(event.type).toBe('project_seen');
    if (event.type !== 'project_seen') {
      throw new Error('expected project_seen');
    }

    expect(event.payload.observation?.worktrees.groupBy).toBe('device');
    expect(heartbeat.type).toBe('client_heartbeat');
  });

  it('accepts richer worktree, archive, and handoff/output event payloads', () => {
    const worktree = cockpitEventSchema.parse({
      schemaVersion: cockpitProtocolSchemaVersion,
      eventId: 'evt_worktree',
      sequence: 9,
      occurredAt: '2026-05-05T20:00:00.000Z',
      source: 'archive',
      projectId: 'project_1',
      deviceId: 'device_1',
      type: 'worktree_seen',
      payload: {
        worktree: {
          worktreeId: 'wt_1',
          worktreePath: './worktrees/api',
          displayName: 'api@martin',
          groupName: 'martin',
          branch: 'feature/api',
          branchUpstream: {
            remoteName: 'origin',
            remoteBranch: 'feature/api',
            trackingBranch: 'origin/feature/api',
            aheadCount: 2,
            behindCount: 1,
          },
          isDirty: true,
          untrackedCount: 4,
        },
      },
    });

    const handoff = cockpitEventSchema.parse({
      schemaVersion: cockpitProtocolSchemaVersion,
      eventId: 'evt_handoff',
      sequence: 10,
      occurredAt: '2026-05-05T20:00:00.000Z',
      source: 'archive',
      projectId: 'project_1',
      deviceId: 'device_1',
      type: 'task_handoff_seen',
      payload: {
        planId: 'plan_1',
        taskId: 'task_1',
        taskName: 'Document changes',
        handoffContent: 'handoff summary',
        contentHash: 'a'.repeat(64),
      },
    });

    const output = cockpitEventSchema.parse({
      schemaVersion: cockpitProtocolSchemaVersion,
      eventId: 'evt_output',
      sequence: 11,
      occurredAt: '2026-05-05T20:00:00.000Z',
      source: 'archive',
      projectId: 'project_1',
      deviceId: 'device_1',
      type: 'task_output_seen',
      payload: {
        planId: 'plan_1',
        taskId: 'task_1',
        taskName: 'Document changes',
        outputTail: 'tail output',
        contentHash: 'b'.repeat(64),
      },
    });

    expect(worktree.type).toBe('worktree_seen');
    expect(handoff.type).toBe('task_handoff_seen');
    expect(output.type).toBe('task_output_seen');
  });

  it('rejects oversize task detail and handoff content', () => {
    expect(() => cockpitEventSchema.parse({
      schemaVersion: cockpitProtocolSchemaVersion,
      eventId: 'evt_detail_limit',
      sequence: 12,
      occurredAt: '2026-05-05T20:00:00.000Z',
      source: 'live',
      projectId: 'project_1',
      deviceId: 'device_1',
      type: 'task_seen',
      payload: {
        planId: 'plan_1',
        taskId: 'task_1',
        taskName: 'Write task detail',
        dependsOn: [],
        execution: {},
        detailContent: 'x'.repeat(12_001),
      },
    })).toThrow();

    expect(() => cockpitEventSchema.parse({
      schemaVersion: cockpitProtocolSchemaVersion,
      eventId: 'evt_handoff_limit',
      sequence: 13,
      occurredAt: '2026-05-05T20:00:00.000Z',
      source: 'live',
      projectId: 'project_1',
      deviceId: 'device_1',
      type: 'task_handoff_seen',
      payload: {
        planId: 'plan_1',
        taskId: 'task_1',
        taskName: 'Write handoff',
        handoffContent: 'x'.repeat(8_001),
      },
    })).toThrow();
  });
});
