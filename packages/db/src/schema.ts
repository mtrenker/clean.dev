import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  pgTable,
} from 'drizzle-orm/pg-core';

import type {
  ArchiveMetadata,
  CockpitEvent,
  DeviceObservationMetadata,
  EventBatch,
  TelemetryProfile,
  ProjectObservationConfig,
  UsageCostEstimate,
  WorktreeSnapshot,
  PlanTaskSummary,
  TaskExecution,
  TokenUsage,
} from '@cleandev/cockpit-protocol';

export interface CockpitProjectedDeviceObservationState extends DeviceObservationMetadata {
  deviceId: string;
  lastEventAt: string;
  lastEventType: CockpitEvent['type'];
  source: CockpitEvent['source'];
  lastHeartbeat?: {
    occurredAt: string;
    daemonVersion?: string | null;
    activePlanId?: string | null;
    activeTaskCount: number;
  } | null;
}

/**
 * Summary of a device currently observed to be running tasks (activeTaskCount > 0).
 * Derived from the devices map at the end of every projection fold.
 */
export interface CockpitActiveFleetEntry {
  deviceId: string;
  deviceName?: string | null;
  instanceName?: string | null;
  activeTaskCount: number;
  activePlanId?: string | null;
  lastHeartbeatAt: string;
}

// Settings table - single row configuration
export const settings = pgTable('settings', {
  id: integer('id').primaryKey().default(1),
  contractorName: text('contractor_name').notNull(),
  contractorAddress: text('contractor_address').notNull(),
  bankName: text('bank_name').notNull(),
  bankIban: text('bank_iban').notNull(),
  bankBic: text('bank_bic').notNull(),
  vatId: text('vat_id').notNull(),
  defaultHourlyRate: numeric('default_hourly_rate', { precision: 10, scale: 2 }).notNull().default('80.00'),
  defaultTaxRate: numeric('default_tax_rate', { precision: 5, scale: 4 }).notNull().default('0.1900'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Clients table
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  vatId: text('vat_id'),
  paymentDueDays: integer('payment_due_days').notNull().default(30),
  earlyPaymentDiscountRate: numeric('early_payment_discount_rate', { precision: 5, scale: 4 }),
  earlyPaymentDueDays: integer('early_payment_due_days'),
  customFields: jsonb('custom_fields').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  timeEntries: many(timeEntries),
  invoices: many(invoices),
}));

// Time entries table
export const timeEntries = pgTable('time_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  hours: numeric('hours', { precision: 6, scale: 2 }).notNull(),
  description: text('description').notNull(),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }).notNull(),
  isInvoiced: boolean('is_invoiced').notNull().default(false),
  invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  client: one(clients, {
    fields: [timeEntries.clientId],
    references: [clients.id],
  }),
  invoice: one(invoices, {
    fields: [timeEntries.invoiceId],
    references: [invoices.id],
  }),
}));

// Invoices table
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  invoiceNumber: text('invoice_number').notNull().unique(),
  invoiceDate: timestamp('invoice_date').notNull(),
  periodDescription: text('period_description').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 4 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  lineItems: many(invoiceLineItems),
  timeEntries: many(timeEntries),
}));

// Invoice line items table
export const invoiceLineItems = pgTable('invoice_line_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
}));

export interface CockpitProjectedPlanState {
  planId: string;
  title: string;
  overview?: string | null;
  sourcePlanPath?: string | null;
  splitAt?: string | null;
  taskCount: number;
  tasks: PlanTaskSummary[];
  lastSeenAt: string;
  source: 'live' | 'archive';
  usage?: TokenUsage;
  costEstimate?: UsageCostEstimate;
  archive?: ArchiveMetadata | null;
}

export interface CockpitProjectedTaskState {
  taskId: string;
  planId: string;
  taskName: string;
  slug?: string;
  source?: 'live' | 'archive';
  status?: 'pending' | 'running' | 'done' | 'failed' | 'retrying';
  dependsOn: string[];
  description?: string | null;
  detailPath?: string | null;
  detailContent?: string | null;
  execution?: TaskExecution;
  archive?: ArchiveMetadata | null;
  worktreeId?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMs?: number | null;
  retries?: number;
  error?: string | null;
  usage?: TokenUsage;
  costEstimate?: UsageCostEstimate;
  latestProgress?: {
    progressStatus: 'running' | 'done' | 'error';
    step?: string | null;
    progressVisible: boolean;
    progressAt: string;
    latestProgressAt?: string | null;
  };
  progressHistory?: Array<{
    progressStatus: 'running' | 'done' | 'error';
    step?: string | null;
    progressVisible: boolean;
    progressAt: string;
    latestProgressAt?: string | null;
  }>;
  handoffSummary?: string | null;
  handoffContentHash?: string | null;
  outputSummary?: string | null;
  outputContentHash?: string | null;
}

export interface CockpitProjectedProjectState {
  schemaVersion: number;
  projectId: string;
  projectName?: string | null;
  projectSlug?: string | null;
  localRootPath?: string | null;
  worktreeRootPath?: string | null;
  telemetry?: TelemetryProfile | null;
  observation?: ProjectObservationConfig | null;
  dirty: boolean;
  lastEvent?: {
    eventId: string;
    sequence: number;
    occurredAt: string;
    type: CockpitEvent['type'];
    deviceId: string;
    sessionId?: string | null;
    runId?: string | null;
    source: CockpitEvent['source'];
  } | null;
  lastHeartbeat?: {
    occurredAt: string;
    daemonVersion?: string | null;
    activePlanId?: string | null;
    activeTaskCount: number;
  } | null;
  devices: Record<string, CockpitProjectedDeviceObservationState>;
  /** Worktrees indexed by worktreeId. */
  worktrees: Record<string, WorktreeSnapshot>;
  /** Worktrees grouped by groupName for display purposes. Maps groupName → worktreeId[]. */
  worktreeGroups: Record<string, string[]>;
  plans: Record<string, CockpitProjectedPlanState>;
  /** Plan IDs from archive sources (source === 'archive'). */
  archivedPlanIds: string[];
  tasks: Record<string, CockpitProjectedTaskState>;
  /** Task IDs from archive sources (source === 'archive'). */
  archivedTaskIds: string[];
  /** Devices currently observed to be running tasks (activeTaskCount > 0 in last heartbeat). */
  activeFleet: CockpitActiveFleetEntry[];
  /** Token usage aggregated by engine name. */
  engineUsage: Record<string, TokenUsage>;
  /** Token usage aggregated by model name. */
  modelUsage: Record<string, TokenUsage>;
  /** Token usage aggregated by profile name. */
  profileUsage: Record<string, TokenUsage>;
  projectUsage?: TokenUsage;
  projectCostEstimate?: UsageCostEstimate;
}

export const cockpitProjects = pgTable('cockpit_projects', {
  projectId: text('project_id').primaryKey(),
  projectSlug: text('project_slug'),
  projectName: text('project_name'),
  localRootPath: text('local_root_path'),
  worktreeRootPath: text('worktree_root_path'),
  telemetry: jsonb('telemetry').$type<TelemetryProfile>(),
  observation: jsonb('observation').$type<ProjectObservationConfig>(),
  latestEventSequence: integer('latest_event_sequence').notNull().default(0),
  latestEventAt: timestamp('latest_event_at', { withTimezone: true }),
  projectionDirty: boolean('projection_dirty').notNull().default(false),
  dirtyMarkedAt: timestamp('dirty_marked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  projectSlugIdx: uniqueIndex('cockpit_projects_project_slug_idx').on(table.projectSlug),
  dirtyIdx: index('cockpit_projects_projection_dirty_idx').on(table.projectionDirty, table.updatedAt),
}));

export const cockpitPairedDevices = pgTable('cockpit_paired_devices', {
  deviceId: text('device_id').primaryKey(),
  deviceName: text('device_name').notNull(),
  instanceName: text('instance_name'),
  metadata: jsonb('metadata').$type<DeviceObservationMetadata>(),
  pairedAt: timestamp('paired_at', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedReason: text('revoked_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  activeDeviceIdx: index('cockpit_paired_devices_active_idx').on(table.revokedAt, table.updatedAt),
}));

export const cockpitDevicePairings = pgTable('cockpit_device_pairings', {
  pairingId: uuid('pairing_id').primaryKey().defaultRandom(),
  deviceCodeHash: text('device_code_hash').notNull(),
  userCode: text('user_code').notNull(),
  deviceId: text('device_id').notNull(),
  deviceName: text('device_name').notNull(),
  instanceName: text('instance_name'),
  status: text('status').$type<'pending' | 'approved' | 'exchanged' | 'expired'>().notNull().default('pending'),
  tokenLabel: text('token_label'),
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  exchangedAt: timestamp('exchanged_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  deviceCodeHashIdx: uniqueIndex('cockpit_device_pairings_device_code_hash_idx').on(table.deviceCodeHash),
  userCodeIdx: uniqueIndex('cockpit_device_pairings_user_code_idx').on(table.userCode),
  pendingIdx: index('cockpit_device_pairings_pending_idx').on(table.status, table.expiresAt),
}));

export const cockpitDeviceTokens = pgTable('cockpit_device_tokens', {
  tokenId: uuid('token_id').primaryKey().defaultRandom(),
  deviceId: text('device_id').notNull().references(() => cockpitPairedDevices.deviceId, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  tokenLabel: text('token_label'),
  issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedReason: text('revoked_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tokenHashIdx: uniqueIndex('cockpit_device_tokens_token_hash_idx').on(table.tokenHash),
  activeTokenIdx: index('cockpit_device_tokens_active_idx').on(table.deviceId, table.revokedAt, table.expiresAt),
}));

export const cockpitDeviceSessions = pgTable('cockpit_device_sessions', {
  sessionId: text('session_id').primaryKey(),
  deviceId: text('device_id').notNull().references(() => cockpitPairedDevices.deviceId, { onDelete: 'cascade' }),
  tokenId: uuid('token_id').references(() => cockpitDeviceTokens.tokenId, { onDelete: 'set null' }),
  connectionId: text('connection_id'),
  instanceName: text('instance_name'),
  lastAckedSequence: integer('last_acked_sequence').notNull().default(0),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  activeSessionIdx: index('cockpit_device_sessions_active_idx').on(table.deviceId, table.endedAt, table.lastSeenAt),
}));

export const cockpitRawEvents = pgTable('cockpit_raw_events', {
  eventId: text('event_id').primaryKey(),
  batchId: text('batch_id').notNull(),
  projectId: text('project_id').notNull().references(() => cockpitProjects.projectId, { onDelete: 'cascade' }),
  deviceId: text('device_id').notNull().references(() => cockpitPairedDevices.deviceId, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  schemaVersion: integer('schema_version').notNull(),
  sequence: integer('sequence').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
  source: text('source').$type<CockpitEvent['source']>().notNull(),
  runId: text('run_id'),
  type: text('type').$type<CockpitEvent['type']>().notNull(),
  payload: jsonb('payload').$type<CockpitEvent['payload']>().notNull(),
  event: jsonb('event').$type<CockpitEvent>().notNull(),
}, (table) => ({
  deviceSequenceIdx: uniqueIndex('cockpit_raw_events_device_sequence_idx').on(table.projectId, table.deviceId, table.sequence),
  projectSequenceIdx: index('cockpit_raw_events_project_sequence_idx').on(table.projectId, table.sequence),
  occurredAtIdx: index('cockpit_raw_events_occurred_at_idx').on(table.occurredAt),
  batchIdx: index('cockpit_raw_events_batch_idx').on(table.batchId),
}));

export const cockpitProjectedProjectState = pgTable('cockpit_projected_project_state', {
  projectId: text('project_id').primaryKey().references(() => cockpitProjects.projectId, { onDelete: 'cascade' }),
  schemaVersion: integer('schema_version').notNull(),
  latestEventId: text('latest_event_id'),
  latestEventSequence: integer('latest_event_sequence').notNull().default(0),
  dirty: boolean('dirty').notNull().default(false),
  projectedAt: timestamp('projected_at', { withTimezone: true }).notNull().defaultNow(),
  state: jsonb('state').$type<CockpitProjectedProjectState>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  dirtyIdx: index('cockpit_projected_project_state_dirty_idx').on(table.dirty, table.updatedAt),
}));

export interface CockpitTaskDetailState {
  detailPath?: string | null;
  detailContent?: string | null;
  handoffSummary?: string | null;
  handoffContentHash?: string | null;
  outputSummary?: string | null;
  outputContentHash?: string | null;
  archive?: ArchiveMetadata | null;
  usage?: TokenUsage;
  costEstimate?: UsageCostEstimate;
}

export const cockpitTaskDetails = pgTable('cockpit_task_details', {
  taskDetailId: uuid('task_detail_id').primaryKey().defaultRandom(),
  projectId: text('project_id').notNull().references(() => cockpitProjects.projectId, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull(),
  taskId: text('task_id').notNull(),
  source: text('source').$type<CockpitEvent['source']>().notNull().default('live'),
  detailPath: text('detail_path'),
  detailContent: text('detail_content'),
  handoffSummary: text('handoff_summary'),
  handoffContentHash: text('handoff_content_hash'),
  outputSummary: text('output_summary'),
  outputContentHash: text('output_content_hash'),
  archiveReviewStatus: text('archive_review_status').$type<'pending' | 'reviewed' | 'dismissed'>(),
  archiveReviewNotes: text('archive_review_notes'),
  archiveReviewedAt: timestamp('archive_reviewed_at', { withTimezone: true }),
  archiveMetadata: jsonb('archive_metadata').$type<ArchiveMetadata>(),
  usage: jsonb('usage').$type<TokenUsage>(),
  costEstimate: jsonb('cost_estimate').$type<UsageCostEstimate>(),
  state: jsonb('state').$type<CockpitTaskDetailState>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  projectTaskIdx: uniqueIndex('cockpit_task_details_project_task_idx').on(
    table.projectId,
    table.source,
    table.taskId,
  ),
  projectPlanIdx: index('cockpit_task_details_project_plan_idx').on(
    table.projectId,
    table.planId,
    table.updatedAt,
  ),
  reviewIdx: index('cockpit_task_details_review_idx').on(
    table.archiveReviewStatus,
    table.updatedAt,
  ),
}));

export const cockpitManualPruneRuns = pgTable('cockpit_manual_prune_runs', {
  pruneRunId: uuid('prune_run_id').primaryKey().defaultRandom(),
  projectId: text('project_id').references(() => cockpitProjects.projectId, { onDelete: 'set null' }),
  requestedBy: text('requested_by'),
  reason: text('reason'),
  prunedThroughSequence: integer('pruned_through_sequence'),
  prunedBefore: timestamp('pruned_before', { withTimezone: true }),
  deletedEventCount: integer('deleted_event_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  pruneProjectIdx: index('cockpit_manual_prune_runs_project_idx').on(table.projectId, table.createdAt),
}));

export const cockpitProjectsRelations = relations(cockpitProjects, ({ many, one }) => ({
  rawEvents: many(cockpitRawEvents),
  projectedState: one(cockpitProjectedProjectState, {
    fields: [cockpitProjects.projectId],
    references: [cockpitProjectedProjectState.projectId],
  }),
  taskDetails: many(cockpitTaskDetails),
  pruneRuns: many(cockpitManualPruneRuns),
}));

export const cockpitPairedDevicesRelations = relations(cockpitPairedDevices, ({ many }) => ({
  tokens: many(cockpitDeviceTokens),
  sessions: many(cockpitDeviceSessions),
  rawEvents: many(cockpitRawEvents),
}));

export const cockpitDeviceTokensRelations = relations(cockpitDeviceTokens, ({ one, many }) => ({
  device: one(cockpitPairedDevices, {
    fields: [cockpitDeviceTokens.deviceId],
    references: [cockpitPairedDevices.deviceId],
  }),
  sessions: many(cockpitDeviceSessions),
}));

export const cockpitDeviceSessionsRelations = relations(cockpitDeviceSessions, ({ one }) => ({
  device: one(cockpitPairedDevices, {
    fields: [cockpitDeviceSessions.deviceId],
    references: [cockpitPairedDevices.deviceId],
  }),
  token: one(cockpitDeviceTokens, {
    fields: [cockpitDeviceSessions.tokenId],
    references: [cockpitDeviceTokens.tokenId],
  }),
}));

export const cockpitRawEventsRelations = relations(cockpitRawEvents, ({ one }) => ({
  project: one(cockpitProjects, {
    fields: [cockpitRawEvents.projectId],
    references: [cockpitProjects.projectId],
  }),
  device: one(cockpitPairedDevices, {
    fields: [cockpitRawEvents.deviceId],
    references: [cockpitPairedDevices.deviceId],
  }),
}));

export const cockpitTaskDetailsRelations = relations(cockpitTaskDetails, ({ one }) => ({
  project: one(cockpitProjects, {
    fields: [cockpitTaskDetails.projectId],
    references: [cockpitProjects.projectId],
  }),
}));

export const cockpitProjectedProjectStateRelations = relations(cockpitProjectedProjectState, ({ one }) => ({
  project: one(cockpitProjects, {
    fields: [cockpitProjectedProjectState.projectId],
    references: [cockpitProjects.projectId],
  }),
}));

export const cockpitManualPruneRunsRelations = relations(cockpitManualPruneRuns, ({ one }) => ({
  project: one(cockpitProjects, {
    fields: [cockpitManualPruneRuns.projectId],
    references: [cockpitProjects.projectId],
  }),
}));
