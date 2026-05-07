import { z } from 'zod';

import { identifierSchema, isoDateTimeSchema, cockpitProtocolSchemaVersionSchema, shortTextSchema } from './config';
import { cockpitEventSchema } from './events';

export const rejectedEventSchema = z.object({
  eventId: identifierSchema,
  sequence: z.number().int().nonnegative().optional(),
  reason: shortTextSchema,
});

export type RejectedEvent = z.infer<typeof rejectedEventSchema>;

export const eventBatchSchema = z.object({
  batchId: identifierSchema,
  sentAt: isoDateTimeSchema,
  events: z.array(cockpitEventSchema).min(1).max(100),
});

export type EventBatch = z.infer<typeof eventBatchSchema>;

export const eventBatchAckSchema = z.object({
  batchId: identifierSchema,
  ackedThroughSequence: z.number().int().nonnegative(),
  acceptedCount: z.number().int().nonnegative(),
  duplicateCount: z.number().int().nonnegative().default(0),
  rejected: z.array(rejectedEventSchema).default([]),
  serverTime: isoDateTimeSchema,
});

export type EventBatchAck = z.infer<typeof eventBatchAckSchema>;

export const clientHelloMessageSchema = z.object({
  type: z.literal('client_hello'),
  schemaVersion: cockpitProtocolSchemaVersionSchema,
  sessionId: identifierSchema,
  deviceId: identifierSchema,
  deviceName: shortTextSchema,
  instanceName: shortTextSchema,
  lastAckedSequence: z.number().int().nonnegative().default(0),
});

export const clientEventBatchMessageSchema = z.object({
  type: z.literal('event_batch'),
  schemaVersion: cockpitProtocolSchemaVersionSchema,
  payload: eventBatchSchema,
});

export const clientHeartbeatMessageSchema = z.object({
  type: z.literal('client_heartbeat'),
  schemaVersion: cockpitProtocolSchemaVersionSchema,
  sentAt: isoDateTimeSchema,
  latestSequence: z.number().int().nonnegative(),
  activeProjectIds: z.array(identifierSchema).max(500).default([]),
});

export const cockpitClientMessageSchema = z.discriminatedUnion('type', [
  clientHelloMessageSchema,
  clientEventBatchMessageSchema,
  clientHeartbeatMessageSchema,
]);

export type CockpitClientMessage = z.infer<typeof cockpitClientMessageSchema>;

export const serverHelloMessageSchema = z.object({
  type: z.literal('server_hello'),
  schemaVersion: cockpitProtocolSchemaVersionSchema,
  connectionId: identifierSchema,
  serverTime: isoDateTimeSchema,
  heartbeatIntervalMs: z.number().int().positive(),
});

export const serverAckMessageSchema = z.object({
  type: z.literal('event_batch_ack'),
  schemaVersion: cockpitProtocolSchemaVersionSchema,
  payload: eventBatchAckSchema,
});

export const serverErrorCodeSchema = z.enum([
  'unauthorized',
  'unsupported_schema',
  'invalid_message',
  'internal_error',
]);

export const serverErrorMessageSchema = z.object({
  type: z.literal('server_error'),
  schemaVersion: cockpitProtocolSchemaVersionSchema,
  code: serverErrorCodeSchema,
  message: shortTextSchema,
  retryable: z.boolean().default(false),
});

export const serverPingMessageSchema = z.object({
  type: z.literal('server_ping'),
  schemaVersion: cockpitProtocolSchemaVersionSchema,
  sentAt: isoDateTimeSchema,
});

export const cockpitServerMessageSchema = z.discriminatedUnion('type', [
  serverHelloMessageSchema,
  serverAckMessageSchema,
  serverErrorMessageSchema,
  serverPingMessageSchema,
]);

export type CockpitServerMessage = z.infer<typeof cockpitServerMessageSchema>;
