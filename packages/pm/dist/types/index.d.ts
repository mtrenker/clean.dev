import { z } from 'zod';
export declare const settingsSchema: z.ZodObject<{
    id: z.ZodNumber;
    contractorName: z.ZodString;
    contractorAddress: z.ZodString;
    bankName: z.ZodString;
    bankIban: z.ZodString;
    bankBic: z.ZodString;
    vatId: z.ZodString;
    defaultHourlyRate: z.ZodString;
    defaultTaxRate: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    contractorName: string;
    contractorAddress: string;
    bankName: string;
    bankIban: string;
    bankBic: string;
    vatId: string;
    defaultHourlyRate: string;
    defaultTaxRate: string;
    createdAt: Date;
    updatedAt: Date;
}, {
    id: number;
    contractorName: string;
    contractorAddress: string;
    bankName: string;
    bankIban: string;
    bankBic: string;
    vatId: string;
    defaultHourlyRate: string;
    defaultTaxRate: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateSettingsSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodNumber>;
    contractorName: z.ZodOptional<z.ZodString>;
    contractorAddress: z.ZodOptional<z.ZodString>;
    bankName: z.ZodOptional<z.ZodString>;
    bankIban: z.ZodOptional<z.ZodString>;
    bankBic: z.ZodOptional<z.ZodString>;
    vatId: z.ZodOptional<z.ZodString>;
    defaultHourlyRate: z.ZodOptional<z.ZodString>;
    defaultTaxRate: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, "id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    contractorName?: string | undefined;
    contractorAddress?: string | undefined;
    bankName?: string | undefined;
    bankIban?: string | undefined;
    bankBic?: string | undefined;
    vatId?: string | undefined;
    defaultHourlyRate?: string | undefined;
    defaultTaxRate?: string | undefined;
}, {
    contractorName?: string | undefined;
    contractorAddress?: string | undefined;
    bankName?: string | undefined;
    bankIban?: string | undefined;
    bankBic?: string | undefined;
    vatId?: string | undefined;
    defaultHourlyRate?: string | undefined;
    defaultTaxRate?: string | undefined;
}>;
export type Settings = z.infer<typeof settingsSchema>;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
export declare const clientSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    address: z.ZodString;
    vatId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    paymentDueDays: z.ZodDefault<z.ZodNumber>;
    earlyPaymentDiscountRate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    earlyPaymentDueDays: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    customFields: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    address: string;
    paymentDueDays: number;
    customFields: Record<string, unknown>;
    vatId?: string | null | undefined;
    earlyPaymentDiscountRate?: string | null | undefined;
    earlyPaymentDueDays?: number | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    address: string;
    vatId?: string | null | undefined;
    paymentDueDays?: number | undefined;
    earlyPaymentDiscountRate?: string | null | undefined;
    earlyPaymentDueDays?: number | null | undefined;
    customFields?: Record<string, unknown> | undefined;
}>;
export declare const createClientSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    name: z.ZodString;
    address: z.ZodString;
    vatId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    paymentDueDays: z.ZodDefault<z.ZodNumber>;
    earlyPaymentDiscountRate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    earlyPaymentDueDays: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    customFields: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    name: string;
    address: string;
    paymentDueDays: number;
    customFields: Record<string, unknown>;
    vatId?: string | null | undefined;
    earlyPaymentDiscountRate?: string | null | undefined;
    earlyPaymentDueDays?: number | null | undefined;
}, {
    name: string;
    address: string;
    vatId?: string | null | undefined;
    paymentDueDays?: number | undefined;
    earlyPaymentDiscountRate?: string | null | undefined;
    earlyPaymentDueDays?: number | null | undefined;
    customFields?: Record<string, unknown> | undefined;
}>;
export declare const updateClientSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    vatId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    paymentDueDays: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    earlyPaymentDiscountRate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    earlyPaymentDueDays: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    customFields: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, "id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    vatId?: string | null | undefined;
    name?: string | undefined;
    address?: string | undefined;
    paymentDueDays?: number | undefined;
    earlyPaymentDiscountRate?: string | null | undefined;
    earlyPaymentDueDays?: number | null | undefined;
    customFields?: Record<string, unknown> | undefined;
}, {
    vatId?: string | null | undefined;
    name?: string | undefined;
    address?: string | undefined;
    paymentDueDays?: number | undefined;
    earlyPaymentDiscountRate?: string | null | undefined;
    earlyPaymentDueDays?: number | null | undefined;
    customFields?: Record<string, unknown> | undefined;
}>;
export type Client = z.infer<typeof clientSchema>;
export type CreateClient = z.infer<typeof createClientSchema>;
export type UpdateClient = z.infer<typeof updateClientSchema>;
export declare const timeEntrySchema: z.ZodObject<{
    id: z.ZodString;
    clientId: z.ZodString;
    date: z.ZodDate;
    hours: z.ZodString;
    description: z.ZodString;
    hourlyRate: z.ZodString;
    isInvoiced: z.ZodBoolean;
    invoiceId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    clientId: string;
    date: Date;
    hours: string;
    description: string;
    hourlyRate: string;
    isInvoiced: boolean;
    invoiceId?: string | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    clientId: string;
    date: Date;
    hours: string;
    description: string;
    hourlyRate: string;
    isInvoiced: boolean;
    invoiceId?: string | null | undefined;
}>;
export declare const createTimeEntrySchema: z.ZodObject<Omit<{
    id: z.ZodString;
    clientId: z.ZodString;
    date: z.ZodDate;
    hours: z.ZodString;
    description: z.ZodString;
    hourlyRate: z.ZodString;
    isInvoiced: z.ZodBoolean;
    invoiceId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "id" | "createdAt" | "updatedAt" | "isInvoiced" | "invoiceId">, "strip", z.ZodTypeAny, {
    clientId: string;
    date: Date;
    hours: string;
    description: string;
    hourlyRate: string;
}, {
    clientId: string;
    date: Date;
    hours: string;
    description: string;
    hourlyRate: string;
}>;
export declare const updateTimeEntrySchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodDate>;
    hours: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    hourlyRate: z.ZodOptional<z.ZodString>;
    isInvoiced: z.ZodOptional<z.ZodBoolean>;
    invoiceId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, "id" | "createdAt" | "updatedAt" | "clientId" | "isInvoiced" | "invoiceId">, "strip", z.ZodTypeAny, {
    date?: Date | undefined;
    hours?: string | undefined;
    description?: string | undefined;
    hourlyRate?: string | undefined;
}, {
    date?: Date | undefined;
    hours?: string | undefined;
    description?: string | undefined;
    hourlyRate?: string | undefined;
}>;
export type TimeEntry = z.infer<typeof timeEntrySchema>;
export type CreateTimeEntry = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntry = z.infer<typeof updateTimeEntrySchema>;
export declare const invoiceSchema: z.ZodObject<{
    id: z.ZodString;
    clientId: z.ZodString;
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodDate;
    periodDescription: z.ZodString;
    subtotal: z.ZodString;
    taxRate: z.ZodString;
    taxAmount: z.ZodString;
    total: z.ZodString;
    sentAt: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    clientId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    periodDescription: string;
    subtotal: string;
    taxRate: string;
    taxAmount: string;
    total: string;
    sentAt?: Date | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    clientId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    periodDescription: string;
    subtotal: string;
    taxRate: string;
    taxAmount: string;
    total: string;
    sentAt?: Date | null | undefined;
}>;
export declare const createInvoiceSchema: z.ZodObject<{
    clientId: z.ZodString;
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodDate;
    periodDescription: z.ZodString;
    timeEntryIds: z.ZodArray<z.ZodString, "many">;
    taxRate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    clientId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    periodDescription: string;
    timeEntryIds: string[];
    taxRate?: string | undefined;
}, {
    clientId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    periodDescription: string;
    timeEntryIds: string[];
    taxRate?: string | undefined;
}>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type CreateInvoice = z.infer<typeof createInvoiceSchema>;
export declare const invoiceLineItemSchema: z.ZodObject<{
    id: z.ZodString;
    invoiceId: z.ZodString;
    position: z.ZodNumber;
    description: z.ZodString;
    quantity: z.ZodString;
    unitPrice: z.ZodString;
    amount: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    description: string;
    invoiceId: string;
    position: number;
    quantity: string;
    unitPrice: string;
    amount: string;
}, {
    id: string;
    createdAt: Date;
    description: string;
    invoiceId: string;
    position: number;
    quantity: string;
    unitPrice: string;
    amount: string;
}>;
export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>;
export interface InvoiceWithDetails extends Invoice {
    client: Client;
    lineItems: InvoiceLineItem[];
}
//# sourceMappingURL=index.d.ts.map