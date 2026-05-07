"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cockpitManualPruneRunsRelations = exports.cockpitProjectedProjectStateRelations = exports.cockpitRawEventsRelations = exports.cockpitDeviceSessionsRelations = exports.cockpitDeviceTokensRelations = exports.cockpitPairedDevicesRelations = exports.cockpitProjectsRelations = exports.cockpitManualPruneRuns = exports.cockpitProjectedProjectState = exports.cockpitRawEvents = exports.cockpitDeviceSessions = exports.cockpitDeviceTokens = exports.cockpitDevicePairings = exports.cockpitPairedDevices = exports.cockpitProjects = exports.invoiceLineItemsRelations = exports.invoiceLineItems = exports.invoicesRelations = exports.invoices = exports.timeEntriesRelations = exports.timeEntries = exports.clientsRelations = exports.clients = exports.settings = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
// Settings table - single row configuration
exports.settings = (0, pg_core_1.pgTable)('settings', {
    id: (0, pg_core_1.integer)('id').primaryKey().default(1),
    contractorName: (0, pg_core_1.text)('contractor_name').notNull(),
    contractorAddress: (0, pg_core_1.text)('contractor_address').notNull(),
    bankName: (0, pg_core_1.text)('bank_name').notNull(),
    bankIban: (0, pg_core_1.text)('bank_iban').notNull(),
    bankBic: (0, pg_core_1.text)('bank_bic').notNull(),
    vatId: (0, pg_core_1.text)('vat_id').notNull(),
    defaultHourlyRate: (0, pg_core_1.numeric)('default_hourly_rate', { precision: 10, scale: 2 }).notNull().default('80.00'),
    defaultTaxRate: (0, pg_core_1.numeric)('default_tax_rate', { precision: 5, scale: 4 }).notNull().default('0.1900'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
// Clients table
exports.clients = (0, pg_core_1.pgTable)('clients', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)('name').notNull(),
    address: (0, pg_core_1.text)('address').notNull(),
    vatId: (0, pg_core_1.text)('vat_id'),
    paymentDueDays: (0, pg_core_1.integer)('payment_due_days').notNull().default(30),
    earlyPaymentDiscountRate: (0, pg_core_1.numeric)('early_payment_discount_rate', { precision: 5, scale: 4 }),
    earlyPaymentDueDays: (0, pg_core_1.integer)('early_payment_due_days'),
    customFields: (0, pg_core_1.jsonb)('custom_fields').$type().default({}),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.clientsRelations = (0, drizzle_orm_1.relations)(exports.clients, ({ many }) => ({
    timeEntries: many(exports.timeEntries),
    invoices: many(exports.invoices),
}));
// Time entries table
exports.timeEntries = (0, pg_core_1.pgTable)('time_entries', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    clientId: (0, pg_core_1.uuid)('client_id').notNull().references(() => exports.clients.id, { onDelete: 'cascade' }),
    date: (0, pg_core_1.timestamp)('date').notNull(),
    hours: (0, pg_core_1.numeric)('hours', { precision: 6, scale: 2 }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    hourlyRate: (0, pg_core_1.numeric)('hourly_rate', { precision: 10, scale: 2 }).notNull(),
    isInvoiced: (0, pg_core_1.boolean)('is_invoiced').notNull().default(false),
    invoiceId: (0, pg_core_1.uuid)('invoice_id').references(() => exports.invoices.id, { onDelete: 'set null' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.timeEntriesRelations = (0, drizzle_orm_1.relations)(exports.timeEntries, ({ one }) => ({
    client: one(exports.clients, {
        fields: [exports.timeEntries.clientId],
        references: [exports.clients.id],
    }),
    invoice: one(exports.invoices, {
        fields: [exports.timeEntries.invoiceId],
        references: [exports.invoices.id],
    }),
}));
// Invoices table
exports.invoices = (0, pg_core_1.pgTable)('invoices', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    clientId: (0, pg_core_1.uuid)('client_id').notNull().references(() => exports.clients.id, { onDelete: 'cascade' }),
    invoiceNumber: (0, pg_core_1.text)('invoice_number').notNull().unique(),
    invoiceDate: (0, pg_core_1.timestamp)('invoice_date').notNull(),
    periodDescription: (0, pg_core_1.text)('period_description').notNull(),
    subtotal: (0, pg_core_1.numeric)('subtotal', { precision: 12, scale: 2 }).notNull(),
    taxRate: (0, pg_core_1.numeric)('tax_rate', { precision: 5, scale: 4 }).notNull(),
    taxAmount: (0, pg_core_1.numeric)('tax_amount', { precision: 12, scale: 2 }).notNull(),
    total: (0, pg_core_1.numeric)('total', { precision: 12, scale: 2 }).notNull(),
    sentAt: (0, pg_core_1.timestamp)('sent_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.invoicesRelations = (0, drizzle_orm_1.relations)(exports.invoices, ({ one, many }) => ({
    client: one(exports.clients, {
        fields: [exports.invoices.clientId],
        references: [exports.clients.id],
    }),
    lineItems: many(exports.invoiceLineItems),
    timeEntries: many(exports.timeEntries),
}));
// Invoice line items table
exports.invoiceLineItems = (0, pg_core_1.pgTable)('invoice_line_items', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    invoiceId: (0, pg_core_1.uuid)('invoice_id').notNull().references(() => exports.invoices.id, { onDelete: 'cascade' }),
    position: (0, pg_core_1.integer)('position').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    quantity: (0, pg_core_1.numeric)('quantity', { precision: 10, scale: 2 }).notNull(),
    unitPrice: (0, pg_core_1.numeric)('unit_price', { precision: 10, scale: 2 }).notNull(),
    amount: (0, pg_core_1.numeric)('amount', { precision: 12, scale: 2 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.invoiceLineItemsRelations = (0, drizzle_orm_1.relations)(exports.invoiceLineItems, ({ one }) => ({
    invoice: one(exports.invoices, {
        fields: [exports.invoiceLineItems.invoiceId],
        references: [exports.invoices.id],
    }),
}));
exports.cockpitProjects = (0, pg_core_1.pgTable)('cockpit_projects', {
    projectId: (0, pg_core_1.text)('project_id').primaryKey(),
    projectSlug: (0, pg_core_1.text)('project_slug'),
    projectName: (0, pg_core_1.text)('project_name'),
    localRootPath: (0, pg_core_1.text)('local_root_path'),
    telemetry: (0, pg_core_1.jsonb)('telemetry').$type(),
    latestEventSequence: (0, pg_core_1.integer)('latest_event_sequence').notNull().default(0),
    latestEventAt: (0, pg_core_1.timestamp)('latest_event_at', { withTimezone: true }),
    projectionDirty: (0, pg_core_1.boolean)('projection_dirty').notNull().default(false),
    dirtyMarkedAt: (0, pg_core_1.timestamp)('dirty_marked_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    projectSlugIdx: (0, pg_core_1.uniqueIndex)('cockpit_projects_project_slug_idx').on(table.projectSlug),
    dirtyIdx: (0, pg_core_1.index)('cockpit_projects_projection_dirty_idx').on(table.projectionDirty, table.updatedAt),
}));
exports.cockpitPairedDevices = (0, pg_core_1.pgTable)('cockpit_paired_devices', {
    deviceId: (0, pg_core_1.text)('device_id').primaryKey(),
    deviceName: (0, pg_core_1.text)('device_name').notNull(),
    instanceName: (0, pg_core_1.text)('instance_name'),
    pairedAt: (0, pg_core_1.timestamp)('paired_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: (0, pg_core_1.timestamp)('last_seen_at', { withTimezone: true }),
    revokedAt: (0, pg_core_1.timestamp)('revoked_at', { withTimezone: true }),
    revokedReason: (0, pg_core_1.text)('revoked_reason'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    activeDeviceIdx: (0, pg_core_1.index)('cockpit_paired_devices_active_idx').on(table.revokedAt, table.updatedAt),
}));
exports.cockpitDevicePairings = (0, pg_core_1.pgTable)('cockpit_device_pairings', {
    pairingId: (0, pg_core_1.uuid)('pairing_id').primaryKey().defaultRandom(),
    deviceCodeHash: (0, pg_core_1.text)('device_code_hash').notNull(),
    userCode: (0, pg_core_1.text)('user_code').notNull(),
    deviceId: (0, pg_core_1.text)('device_id').notNull(),
    deviceName: (0, pg_core_1.text)('device_name').notNull(),
    instanceName: (0, pg_core_1.text)('instance_name'),
    status: (0, pg_core_1.text)('status').$type().notNull().default('pending'),
    tokenLabel: (0, pg_core_1.text)('token_label'),
    approvedBy: (0, pg_core_1.text)('approved_by'),
    approvedAt: (0, pg_core_1.timestamp)('approved_at', { withTimezone: true }),
    exchangedAt: (0, pg_core_1.timestamp)('exchanged_at', { withTimezone: true }),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    deviceCodeHashIdx: (0, pg_core_1.uniqueIndex)('cockpit_device_pairings_device_code_hash_idx').on(table.deviceCodeHash),
    userCodeIdx: (0, pg_core_1.uniqueIndex)('cockpit_device_pairings_user_code_idx').on(table.userCode),
    pendingIdx: (0, pg_core_1.index)('cockpit_device_pairings_pending_idx').on(table.status, table.expiresAt),
}));
exports.cockpitDeviceTokens = (0, pg_core_1.pgTable)('cockpit_device_tokens', {
    tokenId: (0, pg_core_1.uuid)('token_id').primaryKey().defaultRandom(),
    deviceId: (0, pg_core_1.text)('device_id').notNull().references(() => exports.cockpitPairedDevices.deviceId, { onDelete: 'cascade' }),
    tokenHash: (0, pg_core_1.text)('token_hash').notNull(),
    tokenLabel: (0, pg_core_1.text)('token_label'),
    issuedAt: (0, pg_core_1.timestamp)('issued_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }),
    lastUsedAt: (0, pg_core_1.timestamp)('last_used_at', { withTimezone: true }),
    revokedAt: (0, pg_core_1.timestamp)('revoked_at', { withTimezone: true }),
    revokedReason: (0, pg_core_1.text)('revoked_reason'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    tokenHashIdx: (0, pg_core_1.uniqueIndex)('cockpit_device_tokens_token_hash_idx').on(table.tokenHash),
    activeTokenIdx: (0, pg_core_1.index)('cockpit_device_tokens_active_idx').on(table.deviceId, table.revokedAt, table.expiresAt),
}));
exports.cockpitDeviceSessions = (0, pg_core_1.pgTable)('cockpit_device_sessions', {
    sessionId: (0, pg_core_1.text)('session_id').primaryKey(),
    deviceId: (0, pg_core_1.text)('device_id').notNull().references(() => exports.cockpitPairedDevices.deviceId, { onDelete: 'cascade' }),
    tokenId: (0, pg_core_1.uuid)('token_id').references(() => exports.cockpitDeviceTokens.tokenId, { onDelete: 'set null' }),
    connectionId: (0, pg_core_1.text)('connection_id'),
    instanceName: (0, pg_core_1.text)('instance_name'),
    lastAckedSequence: (0, pg_core_1.integer)('last_acked_sequence').notNull().default(0),
    startedAt: (0, pg_core_1.timestamp)('started_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: (0, pg_core_1.timestamp)('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: (0, pg_core_1.timestamp)('ended_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    activeSessionIdx: (0, pg_core_1.index)('cockpit_device_sessions_active_idx').on(table.deviceId, table.endedAt, table.lastSeenAt),
}));
exports.cockpitRawEvents = (0, pg_core_1.pgTable)('cockpit_raw_events', {
    eventId: (0, pg_core_1.text)('event_id').primaryKey(),
    batchId: (0, pg_core_1.text)('batch_id').notNull(),
    projectId: (0, pg_core_1.text)('project_id').notNull().references(() => exports.cockpitProjects.projectId, { onDelete: 'cascade' }),
    deviceId: (0, pg_core_1.text)('device_id').notNull().references(() => exports.cockpitPairedDevices.deviceId, { onDelete: 'cascade' }),
    sessionId: (0, pg_core_1.text)('session_id'),
    schemaVersion: (0, pg_core_1.integer)('schema_version').notNull(),
    sequence: (0, pg_core_1.integer)('sequence').notNull(),
    occurredAt: (0, pg_core_1.timestamp)('occurred_at', { withTimezone: true }).notNull(),
    receivedAt: (0, pg_core_1.timestamp)('received_at', { withTimezone: true }).notNull().defaultNow(),
    source: (0, pg_core_1.text)('source').$type().notNull(),
    runId: (0, pg_core_1.text)('run_id'),
    type: (0, pg_core_1.text)('type').$type().notNull(),
    payload: (0, pg_core_1.jsonb)('payload').$type().notNull(),
    event: (0, pg_core_1.jsonb)('event').$type().notNull(),
}, (table) => ({
    deviceSequenceIdx: (0, pg_core_1.uniqueIndex)('cockpit_raw_events_device_sequence_idx').on(table.projectId, table.deviceId, table.sequence),
    projectSequenceIdx: (0, pg_core_1.index)('cockpit_raw_events_project_sequence_idx').on(table.projectId, table.sequence),
    occurredAtIdx: (0, pg_core_1.index)('cockpit_raw_events_occurred_at_idx').on(table.occurredAt),
    batchIdx: (0, pg_core_1.index)('cockpit_raw_events_batch_idx').on(table.batchId),
}));
exports.cockpitProjectedProjectState = (0, pg_core_1.pgTable)('cockpit_projected_project_state', {
    projectId: (0, pg_core_1.text)('project_id').primaryKey().references(() => exports.cockpitProjects.projectId, { onDelete: 'cascade' }),
    schemaVersion: (0, pg_core_1.integer)('schema_version').notNull(),
    latestEventId: (0, pg_core_1.text)('latest_event_id'),
    latestEventSequence: (0, pg_core_1.integer)('latest_event_sequence').notNull().default(0),
    dirty: (0, pg_core_1.boolean)('dirty').notNull().default(false),
    projectedAt: (0, pg_core_1.timestamp)('projected_at', { withTimezone: true }).notNull().defaultNow(),
    state: (0, pg_core_1.jsonb)('state').$type().notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    dirtyIdx: (0, pg_core_1.index)('cockpit_projected_project_state_dirty_idx').on(table.dirty, table.updatedAt),
}));
exports.cockpitManualPruneRuns = (0, pg_core_1.pgTable)('cockpit_manual_prune_runs', {
    pruneRunId: (0, pg_core_1.uuid)('prune_run_id').primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.text)('project_id').references(() => exports.cockpitProjects.projectId, { onDelete: 'set null' }),
    requestedBy: (0, pg_core_1.text)('requested_by'),
    reason: (0, pg_core_1.text)('reason'),
    prunedThroughSequence: (0, pg_core_1.integer)('pruned_through_sequence'),
    prunedBefore: (0, pg_core_1.timestamp)('pruned_before', { withTimezone: true }),
    deletedEventCount: (0, pg_core_1.integer)('deleted_event_count').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    pruneProjectIdx: (0, pg_core_1.index)('cockpit_manual_prune_runs_project_idx').on(table.projectId, table.createdAt),
}));
exports.cockpitProjectsRelations = (0, drizzle_orm_1.relations)(exports.cockpitProjects, ({ many, one }) => ({
    rawEvents: many(exports.cockpitRawEvents),
    projectedState: one(exports.cockpitProjectedProjectState, {
        fields: [exports.cockpitProjects.projectId],
        references: [exports.cockpitProjectedProjectState.projectId],
    }),
    pruneRuns: many(exports.cockpitManualPruneRuns),
}));
exports.cockpitPairedDevicesRelations = (0, drizzle_orm_1.relations)(exports.cockpitPairedDevices, ({ many }) => ({
    tokens: many(exports.cockpitDeviceTokens),
    sessions: many(exports.cockpitDeviceSessions),
    rawEvents: many(exports.cockpitRawEvents),
}));
exports.cockpitDeviceTokensRelations = (0, drizzle_orm_1.relations)(exports.cockpitDeviceTokens, ({ one, many }) => ({
    device: one(exports.cockpitPairedDevices, {
        fields: [exports.cockpitDeviceTokens.deviceId],
        references: [exports.cockpitPairedDevices.deviceId],
    }),
    sessions: many(exports.cockpitDeviceSessions),
}));
exports.cockpitDeviceSessionsRelations = (0, drizzle_orm_1.relations)(exports.cockpitDeviceSessions, ({ one }) => ({
    device: one(exports.cockpitPairedDevices, {
        fields: [exports.cockpitDeviceSessions.deviceId],
        references: [exports.cockpitPairedDevices.deviceId],
    }),
    token: one(exports.cockpitDeviceTokens, {
        fields: [exports.cockpitDeviceSessions.tokenId],
        references: [exports.cockpitDeviceTokens.tokenId],
    }),
}));
exports.cockpitRawEventsRelations = (0, drizzle_orm_1.relations)(exports.cockpitRawEvents, ({ one }) => ({
    project: one(exports.cockpitProjects, {
        fields: [exports.cockpitRawEvents.projectId],
        references: [exports.cockpitProjects.projectId],
    }),
    device: one(exports.cockpitPairedDevices, {
        fields: [exports.cockpitRawEvents.deviceId],
        references: [exports.cockpitPairedDevices.deviceId],
    }),
}));
exports.cockpitProjectedProjectStateRelations = (0, drizzle_orm_1.relations)(exports.cockpitProjectedProjectState, ({ one }) => ({
    project: one(exports.cockpitProjects, {
        fields: [exports.cockpitProjectedProjectState.projectId],
        references: [exports.cockpitProjects.projectId],
    }),
}));
exports.cockpitManualPruneRunsRelations = (0, drizzle_orm_1.relations)(exports.cockpitManualPruneRuns, ({ one }) => ({
    project: one(exports.cockpitProjects, {
        fields: [exports.cockpitManualPruneRuns.projectId],
        references: [exports.cockpitProjects.projectId],
    }),
}));
