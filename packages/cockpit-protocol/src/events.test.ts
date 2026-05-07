import { describe, expect, it } from 'vitest';

import { daemonConfigSchema, telemetryProfilePresets } from './config';
import { cockpitEventSchema } from './events';
import { cockpitClientMessageSchema, cockpitServerMessageSchema } from './messages';

describe('@cleandev/cockpit-protocol', () => {
  it('parses daemon config with balanced telemetry defaults', () => {
    const parsed = daemonConfigSchema.parse({
      schemaVersion: 1,
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
});
