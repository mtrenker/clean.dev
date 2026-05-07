import { z } from 'zod';

import {
  cockpitProtocolSchemaVersion,
  cockpitProtocolSchemaVersionSchema,
  identifierSchema,
  isoDateTimeSchema,
  longTextSchema,
  shortTextSchema,
  telemetryProfileSchema,
} from './config';

export const taskLifecycleStatusSchema = z.enum(['pending', 'running', 'done', 'failed', 'retrying']);
export const progressEntryStatusSchema = z.enum(['running', 'done', 'error']);
export const eventSourceSchema = z.enum(['live', 'archive']);

export const tokenUsageSchema = z.object({
  inputTokens: z.number().int().nonnegative().default(0),
  outputTokens: z.number().int().nonnegative().default(0),
});

export type TokenUsage = z.infer<typeof tokenUsageSchema>;

export const taskExecutionSchema = z.object({
  agentRole: shortTextSchema.nullable().optional(),
  engine: shortTextSchema.nullable().optional(),
  provider: shortTextSchema.nullable().optional(),
  model: shortTextSchema.nullable().optional(),
  profile: shortTextSchema.nullable().optional(),
  thinking: shortTextSchema.nullable().optional(),
});

export type TaskExecution = z.infer<typeof taskExecutionSchema>;

export const worktreeSnapshotSchema = z.object({
  worktreeId: identifierSchema,
  repoRootPath: z.string().min(1).max(2_000).nullable().optional(),
  worktreePath: z.string().min(1).max(2_000).nullable().optional(),
  branch: shortTextSchema.nullable().optional(),
  headSha: z.string().regex(/^[0-9a-f]{7,40}$/i).nullable().optional(),
  isDirty: z.boolean(),
  untrackedCount: z.number().int().nonnegative().default(0),
  aheadCount: z.number().int().nonnegative().nullable().optional(),
  behindCount: z.number().int().nonnegative().nullable().optional(),
  lastObservedAt: isoDateTimeSchema.optional(),
});

export type WorktreeSnapshot = z.infer<typeof worktreeSnapshotSchema>;

export const planTaskSummarySchema = z.object({
  taskId: identifierSchema,
  slug: identifierSchema.optional(),
  name: shortTextSchema,
  dependsOn: z.array(identifierSchema).max(100).default([]),
  description: longTextSchema.nullable().optional(),
}).merge(taskExecutionSchema);

export type PlanTaskSummary = z.infer<typeof planTaskSummarySchema>;

const eventMetadataSchema = z.object({
  schemaVersion: cockpitProtocolSchemaVersionSchema.default(cockpitProtocolSchemaVersion),
  eventId: identifierSchema,
  sequence: z.number().int().nonnegative(),
  occurredAt: isoDateTimeSchema,
  source: eventSourceSchema.default('live'),
  projectId: identifierSchema,
  deviceId: identifierSchema,
  sessionId: identifierSchema.optional(),
  runId: identifierSchema.nullable().optional(),
});

const buildEventSchema = <TType extends string, TPayload extends z.ZodRawShape>(
  type: TType,
  payload: TPayload,
) =>
  eventMetadataSchema.extend({
    type: z.literal(type),
    payload: z.object(payload),
  });

export const projectSeenEventSchema = buildEventSchema('project_seen', {
  projectName: shortTextSchema.nullable().optional(),
  telemetry: telemetryProfileSchema,
  localRootPath: z.string().min(1).max(2_000).nullable().optional(),
});

export const projectHeartbeatEventSchema = buildEventSchema('project_heartbeat', {
  daemonVersion: shortTextSchema.nullable().optional(),
  activePlanId: identifierSchema.nullable().optional(),
  activeTaskCount: z.number().int().nonnegative().default(0),
});

export const worktreeSeenEventSchema = buildEventSchema('worktree_seen', {
  worktree: worktreeSnapshotSchema,
});

export const worktreeChangedEventSchema = buildEventSchema('worktree_changed', {
  worktree: worktreeSnapshotSchema,
  previousHeadSha: z.string().regex(/^[0-9a-f]{7,40}$/i).nullable().optional(),
});

export const planSeenEventSchema = buildEventSchema('plan_seen', {
  planId: identifierSchema,
  title: shortTextSchema,
  overview: longTextSchema.nullable().optional(),
  sourcePlanPath: z.string().min(1).max(2_000).nullable().optional(),
  splitAt: isoDateTimeSchema.nullable().optional(),
  taskCount: z.number().int().nonnegative(),
  tasks: z.array(planTaskSummarySchema).max(500).default([]),
});

export const taskSeenEventSchema = buildEventSchema('task_seen', {
  planId: identifierSchema,
  taskId: identifierSchema,
  taskName: shortTextSchema,
  slug: identifierSchema.optional(),
  dependsOn: z.array(identifierSchema).max(100).default([]),
  description: longTextSchema.nullable().optional(),
  execution: taskExecutionSchema,
});

export const taskStartedEventSchema = buildEventSchema('task_started', {
  planId: identifierSchema,
  taskId: identifierSchema,
  taskName: shortTextSchema,
  status: z.literal('running'),
  startedAt: isoDateTimeSchema,
  worktreeId: identifierSchema.nullable().optional(),
  execution: taskExecutionSchema,
});

export const taskProgressedEventSchema = buildEventSchema('task_progressed', {
  planId: identifierSchema,
  taskId: identifierSchema,
  taskName: shortTextSchema,
  progressStatus: progressEntryStatusSchema,
  step: longTextSchema.nullable().optional(),
  progressVisible: z.boolean().default(true),
  progressAt: isoDateTimeSchema,
  latestProgressAt: isoDateTimeSchema.nullable().optional(),
});

export const taskCompletedEventSchema = buildEventSchema('task_completed', {
  planId: identifierSchema,
  taskId: identifierSchema,
  taskName: shortTextSchema,
  status: z.literal('done'),
  startedAt: isoDateTimeSchema.nullable().optional(),
  completedAt: isoDateTimeSchema,
  durationMs: z.number().int().nonnegative().nullable().optional(),
  retries: z.number().int().nonnegative().default(0),
  usage: tokenUsageSchema.optional(),
});

export const taskFailedEventSchema = buildEventSchema('task_failed', {
  planId: identifierSchema,
  taskId: identifierSchema,
  taskName: shortTextSchema,
  status: z.literal('failed'),
  startedAt: isoDateTimeSchema.nullable().optional(),
  completedAt: isoDateTimeSchema.nullable().optional(),
  durationMs: z.number().int().nonnegative().nullable().optional(),
  retries: z.number().int().nonnegative().default(0),
  error: longTextSchema,
  usage: tokenUsageSchema.optional(),
});

export const usageReportedEventSchema = buildEventSchema('usage_reported', {
  planId: identifierSchema.nullable().optional(),
  taskId: identifierSchema.nullable().optional(),
  status: taskLifecycleStatusSchema.optional(),
  usage: tokenUsageSchema,
});

export const cockpitEventSchema = z.discriminatedUnion('type', [
  projectSeenEventSchema,
  projectHeartbeatEventSchema,
  worktreeSeenEventSchema,
  worktreeChangedEventSchema,
  planSeenEventSchema,
  taskSeenEventSchema,
  taskStartedEventSchema,
  taskProgressedEventSchema,
  taskCompletedEventSchema,
  taskFailedEventSchema,
  usageReportedEventSchema,
]);

export type CockpitEvent = z.infer<typeof cockpitEventSchema>;
export type ProjectSeenEvent = z.infer<typeof projectSeenEventSchema>;
export type ProjectHeartbeatEvent = z.infer<typeof projectHeartbeatEventSchema>;
export type WorktreeSeenEvent = z.infer<typeof worktreeSeenEventSchema>;
export type WorktreeChangedEvent = z.infer<typeof worktreeChangedEventSchema>;
export type PlanSeenEvent = z.infer<typeof planSeenEventSchema>;
export type TaskSeenEvent = z.infer<typeof taskSeenEventSchema>;
export type TaskStartedEvent = z.infer<typeof taskStartedEventSchema>;
export type TaskProgressedEvent = z.infer<typeof taskProgressedEventSchema>;
export type TaskCompletedEvent = z.infer<typeof taskCompletedEventSchema>;
export type TaskFailedEvent = z.infer<typeof taskFailedEventSchema>;
export type UsageReportedEvent = z.infer<typeof usageReportedEventSchema>;
