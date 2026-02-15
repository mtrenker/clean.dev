"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceLineItemSchema = exports.createInvoiceSchema = exports.invoiceSchema = exports.updateTimeEntrySchema = exports.createTimeEntrySchema = exports.timeEntrySchema = exports.updateClientSchema = exports.createClientSchema = exports.clientSchema = exports.updateSettingsSchema = exports.settingsSchema = void 0;
const zod_1 = require("zod");
// Settings types
exports.settingsSchema = zod_1.z.object({
    id: zod_1.z.number(),
    contractorName: zod_1.z.string(),
    contractorAddress: zod_1.z.string(),
    bankName: zod_1.z.string(),
    bankIban: zod_1.z.string(),
    bankBic: zod_1.z.string(),
    vatId: zod_1.z.string(),
    defaultHourlyRate: zod_1.z.string(),
    defaultTaxRate: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.updateSettingsSchema = exports.settingsSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
// Client types
exports.clientSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    address: zod_1.z.string().min(1),
    vatId: zod_1.z.string().optional().nullable(),
    paymentDueDays: zod_1.z.number().int().positive().default(30),
    earlyPaymentDiscountRate: zod_1.z.string().optional().nullable(),
    earlyPaymentDueDays: zod_1.z.number().int().positive().optional().nullable(),
    customFields: zod_1.z.record(zod_1.z.unknown()).default({}),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.createClientSchema = exports.clientSchema.omit({ id: true, createdAt: true, updatedAt: true });
exports.updateClientSchema = exports.clientSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
// Time entry types
exports.timeEntrySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    clientId: zod_1.z.string().uuid(),
    date: zod_1.z.date(),
    hours: zod_1.z.string(),
    description: zod_1.z.string().min(1),
    hourlyRate: zod_1.z.string(),
    isInvoiced: zod_1.z.boolean(),
    invoiceId: zod_1.z.string().uuid().optional().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.createTimeEntrySchema = exports.timeEntrySchema.omit({
    id: true,
    isInvoiced: true,
    invoiceId: true,
    createdAt: true,
    updatedAt: true
});
exports.updateTimeEntrySchema = exports.timeEntrySchema.partial().omit({
    id: true,
    clientId: true,
    isInvoiced: true,
    invoiceId: true,
    createdAt: true,
    updatedAt: true
});
// Invoice types
exports.invoiceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    clientId: zod_1.z.string().uuid(),
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.date(),
    periodDescription: zod_1.z.string(),
    subtotal: zod_1.z.string(),
    taxRate: zod_1.z.string(),
    taxAmount: zod_1.z.string(),
    total: zod_1.z.string(),
    sentAt: zod_1.z.date().optional().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.createInvoiceSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid(),
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.date(),
    periodDescription: zod_1.z.string(),
    timeEntryIds: zod_1.z.array(zod_1.z.string().uuid()).min(1),
    taxRate: zod_1.z.string().optional(),
});
// Invoice line item types
exports.invoiceLineItemSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    invoiceId: zod_1.z.string().uuid(),
    position: zod_1.z.number(),
    description: zod_1.z.string(),
    quantity: zod_1.z.string(),
    unitPrice: zod_1.z.string(),
    amount: zod_1.z.string(),
    createdAt: zod_1.z.date(),
});
