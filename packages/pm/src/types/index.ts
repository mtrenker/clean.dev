import { z } from 'zod';

// Settings types
export const settingsSchema = z.object({
  id: z.number(),
  contractorName: z.string(),
  contractorAddress: z.string(),
  bankName: z.string(),
  bankIban: z.string(),
  bankBic: z.string(),
  vatId: z.string(),
  defaultHourlyRate: z.string(),
  defaultTaxRate: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const updateSettingsSchema = settingsSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

export type Settings = z.infer<typeof settingsSchema>;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;

// Client types
export const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().min(1),
  vatId: z.string().optional().nullable(),
  paymentDueDays: z.number().int().positive().default(30),
  earlyPaymentDiscountRate: z.string().optional().nullable(),
  earlyPaymentDueDays: z.number().int().positive().optional().nullable(),
  customFields: z.record(z.unknown()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createClientSchema = clientSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateClientSchema = clientSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

export type Client = z.infer<typeof clientSchema>;
export type CreateClient = z.infer<typeof createClientSchema>;
export type UpdateClient = z.infer<typeof updateClientSchema>;

// Time entry types
export const timeEntrySchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  date: z.date(),
  hours: z.string(),
  description: z.string().min(1),
  hourlyRate: z.string(),
  isInvoiced: z.boolean(),
  invoiceId: z.string().uuid().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createTimeEntrySchema = timeEntrySchema.omit({
  id: true,
  isInvoiced: true,
  invoiceId: true,
  createdAt: true,
  updatedAt: true
});

export const updateTimeEntrySchema = timeEntrySchema.partial().omit({
  id: true,
  clientId: true,
  isInvoiced: true,
  invoiceId: true,
  createdAt: true,
  updatedAt: true
});

export type TimeEntry = z.infer<typeof timeEntrySchema>;
export type CreateTimeEntry = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntry = z.infer<typeof updateTimeEntrySchema>;

// Invoice types
export const invoiceSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  invoiceNumber: z.string(),
  invoiceDate: z.date(),
  periodDescription: z.string(),
  subtotal: z.string(),
  taxRate: z.string(),
  taxAmount: z.string(),
  total: z.string(),
  sentAt: z.date().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  invoiceNumber: z.string(),
  invoiceDate: z.date(),
  periodDescription: z.string(),
  timeEntryIds: z.array(z.string().uuid()).min(1),
  taxRate: z.string().optional(),
});

export type Invoice = z.infer<typeof invoiceSchema>;
export type CreateInvoice = z.infer<typeof createInvoiceSchema>;

// Invoice line item types
export const invoiceLineItemSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  position: z.number(),
  description: z.string(),
  quantity: z.string(),
  unitPrice: z.string(),
  amount: z.string(),
  createdAt: z.date(),
});

export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>;

// Invoice with relations
export interface InvoiceWithDetails extends Invoice {
  client: Client;
  lineItems: InvoiceLineItem[];
}
