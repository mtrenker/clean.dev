import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, isNull, gte, lte, like } from 'drizzle-orm';
import type { IProjectManagementAdapter } from './interface';
import * as schema from '../db/schema';
import type {
  Settings,
  UpdateSettings,
  Client,
  CreateClient,
  UpdateClient,
  TimeEntry,
  CreateTimeEntry,
  UpdateTimeEntry,
  Invoice,
  CreateInvoice,
  InvoiceWithDetails,
} from '../types';

export class PostgresAdapter implements IProjectManagementAdapter {
  private db;

  constructor(pool: Pool) {
    this.db = drizzle(pool, { schema });
  }

  // Settings
  async getSettings(): Promise<Settings | null> {
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
        } as any)
        .returning();
      return created as Settings;
    }

    return result[0] || null;
  }

  async updateSettings(data: UpdateSettings): Promise<Settings> {
    const existing = await this.getSettings();

    if (!existing) {
      // Create initial settings
      const [created] = await this.db
        .insert(schema.settings)
        .values({
          ...data,
          updatedAt: new Date(),
        } as any)
        .returning();
      return created as Settings;
    }

    const [updated] = await this.db
      .update(schema.settings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.settings.id, existing.id))
      .returning();

    return updated as Settings;
  }

  // Clients
  async getClients(): Promise<Client[]> {
    const result = await this.db.select().from(schema.clients).orderBy(schema.clients.name);
    return result as Client[];
  }

  async getClient(id: string): Promise<Client | null> {
    const result = await this.db.select().from(schema.clients).where(eq(schema.clients.id, id));
    return (result[0] as Client) || null;
  }

  async createClient(data: CreateClient): Promise<Client> {
    const [created] = await this.db
      .insert(schema.clients)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return created as Client;
  }

  async updateClient(id: string, data: UpdateClient): Promise<Client> {
    const [updated] = await this.db
      .update(schema.clients)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.clients.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Client with id ${id} not found`);
    }

    return updated as Client;
  }

  async deleteClient(id: string): Promise<void> {
    await this.db.delete(schema.clients).where(eq(schema.clients.id, id));
  }

  // Time entries
  async getTimeEntries(clientId?: string): Promise<TimeEntry[]> {
    const query = clientId
      ? this.db.select().from(schema.timeEntries).where(eq(schema.timeEntries.clientId, clientId))
      : this.db.select().from(schema.timeEntries);

    const result = await query.orderBy(schema.timeEntries.date);
    return result as TimeEntry[];
  }

  async getTimeEntry(id: string): Promise<TimeEntry | null> {
    const result = await this.db.select().from(schema.timeEntries).where(eq(schema.timeEntries.id, id));
    return (result[0] as TimeEntry) || null;
  }

  async getUninvoicedTimeEntries(options?: { clientId?: string; fromDate?: Date; toDate?: Date }): Promise<TimeEntry[]> {
    const conditions = [];
    conditions.push(eq(schema.timeEntries.isInvoiced, false));

    if (options?.clientId) {
      conditions.push(eq(schema.timeEntries.clientId, options.clientId));
    }

    if (options?.fromDate) {
      conditions.push(gte(schema.timeEntries.date, options.fromDate));
    }

    if (options?.toDate) {
      conditions.push(lte(schema.timeEntries.date, options.toDate));
    }

    const result = await this.db
      .select()
      .from(schema.timeEntries)
      .where(and(...conditions))
      .orderBy(schema.timeEntries.date);

    return result as TimeEntry[];
  }

  async createTimeEntry(data: CreateTimeEntry): Promise<TimeEntry> {
    const [created] = await this.db
      .insert(schema.timeEntries)
      .values({
        ...data,
        isInvoiced: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return created as TimeEntry;
  }

  async updateTimeEntry(id: string, data: UpdateTimeEntry): Promise<TimeEntry> {
    const [updated] = await this.db
      .update(schema.timeEntries)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.timeEntries.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Time entry with id ${id} not found`);
    }

    return updated as TimeEntry;
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await this.db.delete(schema.timeEntries).where(eq(schema.timeEntries.id, id));
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const result = await this.db.select().from(schema.invoices).orderBy(schema.invoices.invoiceDate);
    return result as Invoice[];
  }

  async getInvoice(id: string): Promise<InvoiceWithDetails | null> {
    const invoiceResult = await this.db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
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
      .where(eq(schema.invoiceLineItems.invoiceId, id))
      .orderBy(schema.invoiceLineItems.position);

    return {
      ...invoice,
      client,
      lineItems,
    } as InvoiceWithDetails;
  }

  async getNextInvoiceNumber(invoiceDate: Date): Promise<string> {
    const year = invoiceDate.getFullYear();
    const month = String(invoiceDate.getMonth() + 1).padStart(2, '0');
    const day = String(invoiceDate.getDate()).padStart(2, '0');
    const prefix = `${year}${month}${day}`;

    // Query invoices with current date prefix
    const existingInvoices = await this.db
      .select({ invoiceNumber: schema.invoices.invoiceNumber })
      .from(schema.invoices)
      .where(like(schema.invoices.invoiceNumber, `${prefix}%`));

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

  async createInvoice(data: CreateInvoice): Promise<InvoiceWithDetails> {
    const { clientId, invoiceNumber, invoiceDate, periodDescription, timeEntryIds, taxRate } = data;

    // Get time entries
    const timeEntries = await this.db
      .select()
      .from(schema.timeEntries)
      .where(eq(schema.timeEntries.clientId, clientId));

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
    const [invoice] = await this.db
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
    const grouped = new Map<string, { hours: number; rate: string }>();

    selectedEntries.forEach((entry) => {
      const key = `${entry.description}|${entry.hourlyRate}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.hours += parseFloat(entry.hours);
      } else {
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

      await this.db.insert(schema.invoiceLineItems).values({
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

    // Update time entries
    await this.db
      .update(schema.timeEntries)
      .set({
        isInvoiced: true,
        invoiceId: invoice.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.timeEntries.clientId, clientId));

    // Return full invoice with details
    const fullInvoice = await this.getInvoice(invoice.id);
    if (!fullInvoice) {
      throw new Error('Failed to retrieve created invoice');
    }

    return fullInvoice;
  }

  async markInvoiceSent(id: string): Promise<Invoice> {
    const [updated] = await this.db
      .update(schema.invoices)
      .set({
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.invoices.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Invoice with id ${id} not found`);
    }

    return updated as Invoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    // Reset time entries
    await this.db
      .update(schema.timeEntries)
      .set({
        isInvoiced: false,
        invoiceId: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.timeEntries.invoiceId, id));

    // Delete invoice (cascade will delete line items)
    await this.db.delete(schema.invoices).where(eq(schema.invoices.id, id));
  }
}
