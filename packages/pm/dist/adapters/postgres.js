"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAdapter = void 0;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../db/schema"));
class PostgresAdapter {
    constructor(pool) {
        this.db = (0, node_postgres_1.drizzle)(pool, { schema });
    }
    // Settings
    async getSettings() {
        const result = await this.db.select().from(schema.settings).limit(1);
        if (!result[0]) {
            // Auto-initialize with default settings
            const [created] = await this.db
                .insert(schema.settings)
                .values({
                contractorName: 'Your Name',
                contractorAddress: 'Your Address\nYour City, ZIP',
                bankName: 'Your Bank',
                bankIban: 'DE00000000000000000000',
                bankBic: 'BANKDEFFXXX',
                vatId: 'DE000000000',
                defaultHourlyRate: '80.00',
                defaultTaxRate: '0.19',
                updatedAt: new Date(),
            })
                .returning();
            return created;
        }
        return result[0] || null;
    }
    async updateSettings(data) {
        const existing = await this.getSettings();
        if (!existing) {
            // Create initial settings
            const [created] = await this.db
                .insert(schema.settings)
                .values({
                ...data,
                updatedAt: new Date(),
            })
                .returning();
            return created;
        }
        const [updated] = await this.db
            .update(schema.settings)
            .set({
            ...data,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.settings.id, existing.id))
            .returning();
        return updated;
    }
    // Clients
    async getClients() {
        const result = await this.db.select().from(schema.clients).orderBy(schema.clients.name);
        return result;
    }
    async getClient(id) {
        const result = await this.db.select().from(schema.clients).where((0, drizzle_orm_1.eq)(schema.clients.id, id));
        return result[0] || null;
    }
    async createClient(data) {
        const [created] = await this.db
            .insert(schema.clients)
            .values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
            .returning();
        return created;
    }
    async updateClient(id, data) {
        const [updated] = await this.db
            .update(schema.clients)
            .set({
            ...data,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.clients.id, id))
            .returning();
        if (!updated) {
            throw new Error(`Client with id ${id} not found`);
        }
        return updated;
    }
    async deleteClient(id) {
        await this.db.delete(schema.clients).where((0, drizzle_orm_1.eq)(schema.clients.id, id));
    }
    // Time entries
    async getTimeEntries(clientId) {
        const query = clientId
            ? this.db.select().from(schema.timeEntries).where((0, drizzle_orm_1.eq)(schema.timeEntries.clientId, clientId))
            : this.db.select().from(schema.timeEntries);
        const result = await query.orderBy(schema.timeEntries.date);
        return result;
    }
    async getTimeEntry(id) {
        const result = await this.db.select().from(schema.timeEntries).where((0, drizzle_orm_1.eq)(schema.timeEntries.id, id));
        return result[0] || null;
    }
    async getUninvoicedTimeEntries(options) {
        const conditions = [];
        conditions.push((0, drizzle_orm_1.eq)(schema.timeEntries.isInvoiced, false));
        if (options?.clientId) {
            conditions.push((0, drizzle_orm_1.eq)(schema.timeEntries.clientId, options.clientId));
        }
        if (options?.fromDate) {
            conditions.push((0, drizzle_orm_1.gte)(schema.timeEntries.date, options.fromDate));
        }
        if (options?.toDate) {
            conditions.push((0, drizzle_orm_1.lte)(schema.timeEntries.date, options.toDate));
        }
        const result = await this.db
            .select()
            .from(schema.timeEntries)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(schema.timeEntries.date);
        return result;
    }
    async createTimeEntry(data) {
        const [created] = await this.db
            .insert(schema.timeEntries)
            .values({
            ...data,
            isInvoiced: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
            .returning();
        return created;
    }
    async updateTimeEntry(id, data) {
        const [updated] = await this.db
            .update(schema.timeEntries)
            .set({
            ...data,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.timeEntries.id, id))
            .returning();
        if (!updated) {
            throw new Error(`Time entry with id ${id} not found`);
        }
        return updated;
    }
    async deleteTimeEntry(id) {
        await this.db.delete(schema.timeEntries).where((0, drizzle_orm_1.eq)(schema.timeEntries.id, id));
    }
    // Invoices
    async getInvoices() {
        const result = await this.db.select().from(schema.invoices).orderBy(schema.invoices.invoiceDate);
        return result;
    }
    async getInvoice(id) {
        const invoiceResult = await this.db.select().from(schema.invoices).where((0, drizzle_orm_1.eq)(schema.invoices.id, id));
        const invoice = invoiceResult[0];
        if (!invoice) {
            return null;
        }
        const client = await this.getClient(invoice.clientId);
        if (!client) {
            throw new Error(`Client with id ${invoice.clientId} not found`);
        }
        const lineItems = await this.db
            .select()
            .from(schema.invoiceLineItems)
            .where((0, drizzle_orm_1.eq)(schema.invoiceLineItems.invoiceId, id))
            .orderBy(schema.invoiceLineItems.position);
        return {
            ...invoice,
            client,
            lineItems,
        };
    }
    async getNextInvoiceNumber(invoiceDate) {
        const year = invoiceDate.getFullYear();
        const month = String(invoiceDate.getMonth() + 1).padStart(2, '0');
        const day = String(invoiceDate.getDate()).padStart(2, '0');
        const prefix = `${year}${month}${day}`;
        // Query invoices with current date prefix
        const existingInvoices = await this.db
            .select({ invoiceNumber: schema.invoices.invoiceNumber })
            .from(schema.invoices)
            .where((0, drizzle_orm_1.like)(schema.invoices.invoiceNumber, `${prefix}%`));
        // Find max number for this date
        let maxNumber = 0;
        for (const invoice of existingInvoices) {
            const numberPart = invoice.invoiceNumber.substring(prefix.length);
            const num = parseInt(numberPart, 10);
            if (!isNaN(num) && num > maxNumber) {
                maxNumber = num;
            }
        }
        // Increment (no padding, just increment)
        const nextNumber = maxNumber + 1;
        return `${prefix}${nextNumber}`;
    }
    async createInvoice(data) {
        const { clientId, invoiceNumber, invoiceDate, periodDescription, timeEntryIds, taxRate } = data;
        return this.db.transaction(async (tx) => {
            // Get time entries
            const timeEntries = await tx
                .select()
                .from(schema.timeEntries)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.timeEntries.clientId, clientId), (0, drizzle_orm_1.inArray)(schema.timeEntries.id, timeEntryIds)));
            const selectedEntries = timeEntries.filter((entry) => timeEntryIds.includes(entry.id));
            if (selectedEntries.length !== timeEntryIds.length) {
                throw new Error('Some time entries not found or belong to different client');
            }
            // Check if any already invoiced
            const alreadyInvoiced = selectedEntries.filter((entry) => entry.isInvoiced);
            if (alreadyInvoiced.length > 0) {
                throw new Error('Some time entries are already invoiced');
            }
            // Calculate totals
            let subtotal = 0;
            selectedEntries.forEach((entry) => {
                const hours = parseFloat(entry.hours);
                const rate = parseFloat(entry.hourlyRate);
                subtotal += hours * rate;
            });
            // Get tax rate
            const settings = await this.getSettings();
            const finalTaxRate = taxRate || settings?.defaultTaxRate || '0.19';
            const taxAmount = subtotal * parseFloat(finalTaxRate);
            const total = subtotal + taxAmount;
            // Create invoice
            const [invoice] = await tx
                .insert(schema.invoices)
                .values({
                clientId,
                invoiceNumber,
                invoiceDate,
                periodDescription,
                subtotal: subtotal.toFixed(2),
                taxRate: finalTaxRate,
                taxAmount: taxAmount.toFixed(2),
                total: total.toFixed(2),
                createdAt: new Date(),
                updatedAt: new Date(),
            })
                .returning();
            // Create line items (group by description and rate)
            const grouped = new Map();
            selectedEntries.forEach((entry) => {
                const key = `${entry.description}|${entry.hourlyRate}`;
                const existing = grouped.get(key);
                if (existing) {
                    existing.hours += parseFloat(entry.hours);
                }
                else {
                    grouped.set(key, {
                        hours: parseFloat(entry.hours),
                        rate: entry.hourlyRate,
                    });
                }
            });
            let position = 1;
            for (const [key, value] of grouped.entries()) {
                const [description] = key.split('|');
                const amount = value.hours * parseFloat(value.rate);
                await tx.insert(schema.invoiceLineItems).values({
                    invoiceId: invoice.id,
                    position,
                    description,
                    quantity: value.hours.toFixed(2),
                    unitPrice: value.rate,
                    amount: amount.toFixed(2),
                    createdAt: new Date(),
                });
                position++;
            }
            // Update selected time entries
            await tx
                .update(schema.timeEntries)
                .set({
                isInvoiced: true,
                invoiceId: invoice.id,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.inArray)(schema.timeEntries.id, timeEntryIds));
            // Return full invoice with details
            const fullInvoice = await this.getInvoice(invoice.id);
            if (!fullInvoice) {
                throw new Error('Failed to retrieve created invoice');
            }
            return fullInvoice;
        });
    }
    async markInvoiceSent(id) {
        const [updated] = await this.db
            .update(schema.invoices)
            .set({
            sentAt: new Date(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.invoices.id, id))
            .returning();
        if (!updated) {
            throw new Error(`Invoice with id ${id} not found`);
        }
        return updated;
    }
    async deleteInvoice(id) {
        // Reset time entries
        await this.db
            .update(schema.timeEntries)
            .set({
            isInvoiced: false,
            invoiceId: null,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.timeEntries.invoiceId, id));
        // Delete invoice (cascade will delete line items)
        await this.db.delete(schema.invoices).where((0, drizzle_orm_1.eq)(schema.invoices.id, id));
    }
}
exports.PostgresAdapter = PostgresAdapter;
