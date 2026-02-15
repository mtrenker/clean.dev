import type { Settings, UpdateSettings, Client, CreateClient, UpdateClient, TimeEntry, CreateTimeEntry, UpdateTimeEntry, Invoice, CreateInvoice, InvoiceWithDetails } from '../types';
export interface IProjectManagementAdapter {
    getSettings(): Promise<Settings | null>;
    updateSettings(data: UpdateSettings): Promise<Settings>;
    getClients(): Promise<Client[]>;
    getClient(id: string): Promise<Client | null>;
    createClient(data: CreateClient): Promise<Client>;
    updateClient(id: string, data: UpdateClient): Promise<Client>;
    deleteClient(id: string): Promise<void>;
    getTimeEntries(clientId?: string): Promise<TimeEntry[]>;
    getTimeEntry(id: string): Promise<TimeEntry | null>;
    getUninvoicedTimeEntries(options?: {
        clientId?: string;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<TimeEntry[]>;
    createTimeEntry(data: CreateTimeEntry): Promise<TimeEntry>;
    updateTimeEntry(id: string, data: UpdateTimeEntry): Promise<TimeEntry>;
    deleteTimeEntry(id: string): Promise<void>;
    getInvoices(): Promise<Invoice[]>;
    getInvoice(id: string): Promise<InvoiceWithDetails | null>;
    getNextInvoiceNumber(invoiceDate: Date): Promise<string>;
    createInvoice(data: CreateInvoice): Promise<InvoiceWithDetails>;
    markInvoiceSent(id: string): Promise<Invoice>;
    deleteInvoice(id: string): Promise<void>;
}
//# sourceMappingURL=interface.d.ts.map