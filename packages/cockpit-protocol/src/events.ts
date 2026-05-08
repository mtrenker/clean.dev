import { z } from 'zod';

import {
  cockpitProtocolSchemaVersion,
  supportedCockpitProtocolSchemaVersionSchema,
  identifierSchema,
  isoDateTimeSchema,
  longTextSchema,
  projectObservationConfigSchema,
  relativeFilePathSchema,
  shortTextSchema,
  telemetryProfileSchema,
} from './config';

export const taskLifecycleStatusSchema = z.enum(['pending', 'running', 'done', 'failed', 'retrying']);
export const progressEntryStatusSchema = z.enum(['running', 'done', 'error']);
export const eventSourceSchema = z.enum(['live', 'archive']);
export const archiveReviewStatusSchema = z.enum(['pending', 'reviewed', 'dismissed']);

const contentHashSchema = z.string().regex(/^[0-9a-f]{64}$/i);
const hexShaSchema = z.string().regex(/^[0-9a-f]{7,40}$/i);
const usdAmountSchema = z.number().nonnegative();

export const branchUpstreamSchema = z.object({
  remoteName: shortTextSchema.nullable().optional(),
  remoteBranch: shortTextSchema.nullable().optional(),
  trackingBranch: shortTextSchema.nullable().optional(),
  aheadCount: z.number().int().nonnegative().nullable().optional(),
  behindCount: z.number().int().nonnegative().nullable().optional(),
  lastFetchedAt: isoDateTimeSchema.nullable().optional(),
});

export type BranchUpstream = z.infer<typeof branchUpstreamSchema>;

export const deviceObservationMetadataSchema = z.object({
  deviceName: shortTextSchema.nullable().optional(),
  instanceName: shortTextSchema.nullable().optional(),
  hostname: shortTextSchema.nullable().optional(),
  platform: shortTextSchema.nullable().optional(),
  appVersion: shortTextSchema.nullable().optional(),
  labels: z.array(shortTextSchema).max(20).default([]),
});

export type DeviceObservationMetadata = z.infer<typeof deviceObservationMetadataSchema>;

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

export const usageCostEstimateSchema = z.object({
  currency: z.literal('USD').default('USD'),
  inputCost: usdAmountSchema.default(0),
  outputCost: usdAmountSchema.default(0),
  totalCost: usdAmountSchema.default(0),
  pricingSource: shortTextSchema.nullable().optional(),
});

export type UsageCostEstimate = z.infer<typeof usageCostEstimateSchema>;

export const archiveMetadataSchema = z.object({
  archiveId: identifierSchema.nullable().optional(),
  archivePath: relativeFilePathSchema.nullable().optional(),
  archivedAt: isoDateTimeSchema.nullable().optional(),
  reviewStatus: archiveReviewStatusSchema.optional(),
  reviewNotes: z.string().max(4_000).nullable().optional(),
  reviewedAt: isoDateTimeSchema.nullable().optional(),
  runId: identifierSchema.nullable().optional(),
});

export type ArchiveMetadata = z.infer<typeof archiveMetadataSchema>;

export const worktreeSnapshotSchema = z.object({
  worktreeId: identifierSchema,
  repoRootPath: z.string().min(1).max(2_000).nullable().optional(),
  worktreePath: z.string().min(1).max(2_000).nullable().optional(),
  displayName: shortTextSchema.nullable().optional(),
  groupName: shortTextSchema.nullable().optional(),
  branch: shortTextSchema.nullable().optional(),
  branchUpstream: branchUpstreamSchema.nullable().optional(),
  headSha: hexShaSchema.nullable().optional(),
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
  status: taskLifecycleStatusSchema.optional(),
  source: eventSourceSchema.optional(),
  dependsOn: z.array(identifierSchema).max(100).default([]),
  description: longTextSchema.nullable().optional(),
  usage: tokenUsageSchema.optional(),
  costEstimate: usageCostEstimateSchema.optional(),
  archive: archiveMetadataSchema.nullable().optional(),
}).merge(taskExecutionSchema);

export type PlanTaskSummary = z.infer<typeof planTaskSummarySchema>;

const eventMetadataSchema = z.object({
  schemaVersion: supportedCockpitProtocolSchemaVersionSchema.default(cockpitProtocolSchemaVersion),
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
  worktreeRootPath: z.string().min(1).max(2_000).nullable().optional(),
  observation: projectObservationConfigSchema.optional(),
});

export const projectHeartbeatEventSchema = buildEventSchema('project_heartbeat', {
  daemonVersion: shortTextSchema.nullable().optional(),
  activePlanId: identifierSchema.nullable().optional(),
  activeTaskCount: z.number().int().nonnegative().default(0),
  device: deviceObservationMetadataSchema.optional(),
  projectUsage: tokenUsageSchema.optional(),
  projectCostEstimate: usageCostEstimateSchema.optional(),
});

export const worktreeSeenEventSchema = buildEventSchema('worktree_seen', {
  worktree: worktreeSnapshotSchema,
});

export const worktreeChangedEventSchema = buildEventSchema('worktree_changed', {
  worktree: worktreeSnapshotSchema,
  previousHeadSha: hexShaSchema.nullable().optional(),
});

export const planSeenEventSchema = buildEventSchema('plan_seen', {
  planId: identifierSchema,
  title: shortTextSchema,
  overview: longTextSchema.nullable().optional(),
  sourcePlanPath: z.string().min(1).max(2_000).nullable().optional(),
  splitAt: isoDateTimeSchema.nullable().optional(),
  taskCount: z.number().int().nonnegative(),
  tasks: z.array(planTaskSummarySchema).max(500).default([]),
  archive: archiveMetadataSchema.nullable().optional(),
  usage: tokenUsageSchema.optional(),
  costEstimate: usageCostEstimateSchema.optional(),
});

export const taskSeenEventSchema = buildEventSchema('task_seen', {
  planId: identifierSchema,
  taskId: identifierSchema,
  taskName: shortTextSchema,
  slug: identifierSchema.optional(),
  dependsOn: z.array(identifierSchema).max(100).default([]),
  description: longTextSchema.nullable().optional(),
  execution: taskExecutionSchema,
  detailPath: relativeFilePathSchema.nullable().optional(),
  detailContent: z.string().max(12_000).nullable().optional(),
  archive: archiveMetadataSchema.nullable().optional(),
});

export const taskStartedEventSchema = buildEventSchema('task_started', {
  planId: identifierSchema,
  taskId: identifierSchema,
  taskName: shortTextSchema,
  status: z.literal('running'),
  startedAt: isoDateTimeSchema,
  worktreeId: identifierSchema.nullable().optional(),
  execution: taskExecutionSchema,
  archive: archiveMetadataSchema.nullable().optional(),
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
  costEstimate: usageCostEstimateSchema.optional(),
  archive: archiveMetadataSchema.nullable().optional(),
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
  costEstimate: usageCostEstimateSchema.optional(),
  archive: archiveMetadataSchema.nullable().optional(),
});

export const usageReportedEventSchema = buildEventSchema('usage_reported', {
  planId: identifierSchema.nullable().optional(),
  taskId: identifierSchema.nullable().optional(),
  status: taskLifecycleStatusSchema.optional(),
  usage: tokenUsageSchema,
  costEstimate: usageCostEstimateSchema.optional(),
  archive: archiveMetadataSchema.nullable().optional(),
});

export const taskHandoffSeenEventSchema = buildEventSchema('task_handoff_seen', {
  planId: identifierSchema,
  taskId: identifierSchema,
  taskName: shortTextSchema,
  handoffContent: z.string().max(8_000).nullable().optional(),
  contentHash: contentHashSchema.nullable().optional(),
});

export const taskOutputSeenEventSchema = buildEventSchema('task_output_seen', {
  planId: identifierSchema,
  taskId: identifierSchema,
  taskName: shortTextSchema,
  outputTail: z.string().max(4_000).nullable().optional(),
  contentHash: contentHashSchema.nullable().optional(),
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
  taskHandoffSeenEventSchema,
  taskOutputSeenEventSchema,
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
export type TaskHandoffSeenEvent = z.infer<typeof taskHandoffSeenEventSchema>;
export type TaskOutputSeenEvent = z.infer<typeof taskOutputSeenEventSchema>;
