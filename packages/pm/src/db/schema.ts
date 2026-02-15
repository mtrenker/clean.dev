import { pgTable, text, timestamp, jsonb, numeric, boolean, integer, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
  customFields: jsonb('custom_fields').default({}),
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
