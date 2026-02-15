"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceLineItemsRelations = exports.invoiceLineItems = exports.invoicesRelations = exports.invoices = exports.timeEntriesRelations = exports.timeEntries = exports.clientsRelations = exports.clients = exports.settings = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
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
    customFields: (0, pg_core_1.jsonb)('custom_fields').default({}),
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
