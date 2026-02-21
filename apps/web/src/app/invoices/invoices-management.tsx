'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Invoice, Client, CreateInvoice } from '@cleandev/pm';
import { createInvoiceAction, deleteInvoiceAction, getUninvoicedEntriesAction, getNextInvoiceNumberAction, sendInvoiceAction } from './actions';
import { Input, Select, FormField, Button, Card } from '@/components/ui';

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'short' }).format(date);
};

const formatPrice = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(num);
};

interface InvoicesManagementProps {
  invoices: Invoice[];
  clients: Client[];
}

export const InvoicesManagement: React.FC<InvoicesManagementProps> = ({ invoices, clients }) => {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [uninvoicedEntries, setUninvoicedEntries] = useState<any[]>([]);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<Set<string>>(new Set());
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [sending, setSending] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<
    Omit<CreateInvoice, 'timeEntryIds' | 'invoiceDate'> & { date: string }
  >();

  const watchedClientId = watch('clientId');
  const watchedDate = watch('date');

  // Set today's date as default when form is shown
  useEffect(() => {
    if (showForm && !watchedDate) {
      const today = new Date().toISOString().split('T')[0];
      setValue('date', today);
    }
  }, [showForm, watchedDate, setValue]);

  // Fetch next invoice number when form is shown or date changes
  useEffect(() => {
    if (showForm && watchedDate) {
      getNextInvoiceNumberAction(watchedDate).then((invoiceNumber) => {
        setValue('invoiceNumber', invoiceNumber);
      });
    }
  }, [showForm, watchedDate, setValue]);

  useEffect(() => {
    if (watchedClientId) {
      getUninvoicedEntriesAction({
        clientId: watchedClientId,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }).then((entries) => {
        setUninvoicedEntries(entries);
        // Auto-select all entries when they change
        setSelectedTimeEntries(new Set(entries.map((e: any) => e.id)));
      });
    }
  }, [watchedClientId, fromDate, toDate]);

  const onSubmit = async (
    data: Omit<CreateInvoice, 'timeEntryIds' | 'invoiceDate'> & { date: string }
  ) => {
    try {
      if (selectedTimeEntries.size === 0) {
        alert('Bitte wählen Sie mindestens eine Zeiterfassung aus');
        return;
      }

      const timeEntryIds = Array.from(selectedTimeEntries);
      await createInvoiceAction({
        ...data,
        timeEntryIds,
      });
      setShowForm(false);
      setSelectedClient('');
      setSelectedTimeEntries(new Set());
      reset();
      router.refresh();
    } catch (error) {
      alert('Fehler beim Erstellen der Rechnung');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Rechnung wirklich löschen?')) return;
    try {
      await deleteInvoiceAction(id);
      router.refresh();
    } catch (error) {
      alert('Fehler beim Löschen der Rechnung');
    }
  };

  const onSend = async (id: string) => {
    if (!confirm('Rechnung wirklich per E-Mail versenden?')) return;
    setSending(id);
    try {
      const result = await sendInvoiceAction(id);
      if (result.success) {
        alert('Rechnung wurde erfolgreich versendet');
        router.refresh();
      } else {
        alert(`Fehler: ${result.error}`);
      }
    } catch (error) {
      alert('Fehler beim Versenden der Rechnung');
    } finally {
      setSending(null);
    }
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
    setValue('clientId', clientId);
  };

  const toggleTimeEntry = (entryId: string) => {
    const newSelected = new Set(selectedTimeEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedTimeEntries(newSelected);
  };

  const toggleAllTimeEntries = () => {
    if (selectedTimeEntries.size === uninvoicedEntries.length) {
      setSelectedTimeEntries(new Set());
    } else {
      setSelectedTimeEntries(new Set(uninvoicedEntries.map((e) => e.id)));
    }
  };

  const calculateTotal = () => {
    return uninvoicedEntries
      .filter((entry) => selectedTimeEntries.has(entry.id))
      .reduce((sum, entry) => sum + parseFloat(entry.hours) * parseFloat(entry.hourlyRate), 0);
  };

  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(lastDay.toISOString().split('T')[0]);

    // Set period description in German format (e.g., "Februar 2026")
    const monthYear = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(firstDay);
    setValue('periodDescription', monthYear);
  };

  const setPreviousMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(lastDay.toISOString().split('T')[0]);

    // Set period description in German format (e.g., "Januar 2026")
    const monthYear = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(firstDay);
    setValue('periodDescription', monthYear);
  };

  return (
    <>
      <div className="mb-6">
        {!showForm && (
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            type="button"
          >
            Neue Rechnung
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Neue Rechnung erstellen</h2>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Kunde" htmlFor="clientId" required>
              <Select
                id="clientId"
                required
                {...register('clientId', { required: true })}
                onChange={(e) => handleClientSelect(e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Von Datum" htmlFor="fromDate">
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </FormField>
              <FormField label="Bis Datum" htmlFor="toDate">
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </FormField>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={setPreviousMonth}
                type="button"
              >
                Vormonat
              </Button>
              <Button
                variant="secondary"
                onClick={setCurrentMonth}
                type="button"
              >
                Aktueller Monat
              </Button>
            </div>

            {uninvoicedEntries.length > 0 && (
              <div className="rounded border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Zeiterfassungen</h3>
                  <button
                    className="text-sm text-accent underline hover:text-accent/80"
                    onClick={toggleAllTimeEntries}
                    type="button"
                  >
                    {selectedTimeEntries.size === uninvoicedEntries.length ? 'Alle abwählen' : 'Alle auswählen'}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted">
                      <tr>
                        <th className="p-2 text-left">
                          <input
                            checked={selectedTimeEntries.size === uninvoicedEntries.length && uninvoicedEntries.length > 0}
                            onChange={toggleAllTimeEntries}
                            type="checkbox"
                          />
                        </th>
                        <th className="p-2 text-left">Datum</th>
                        <th className="p-2 text-left">Beschreibung</th>
                        <th className="p-2 text-right">Stunden</th>
                        <th className="p-2 text-right">Stundensatz</th>
                        <th className="p-2 text-right">Betrag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uninvoicedEntries.map((entry) => {
                        const amount = parseFloat(entry.hours) * parseFloat(entry.hourlyRate);
                        return (
                          <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                            <td className="p-2">
                              <input
                                checked={selectedTimeEntries.has(entry.id)}
                                onChange={() => toggleTimeEntry(entry.id)}
                                type="checkbox"
                              />
                            </td>
                            <td className="p-2">{formatDate(entry.date)}</td>
                            <td className="p-2">{entry.description}</td>
                            <td className="p-2 text-right">{entry.hours}h</td>
                            <td className="p-2 text-right">{formatPrice(entry.hourlyRate)}</td>
                            <td className="p-2 text-right">{formatPrice(amount)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="border-t border-border bg-muted font-medium">
                      <tr>
                        <td colSpan={5} className="p-2 text-right">Gesamt ({selectedTimeEntries.size} ausgewählt):</td>
                        <td className="p-2 text-right">{formatPrice(calculateTotal())}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            <FormField label="Rechnungsnummer" htmlFor="invoiceNumber" required>
              <Input
                id="invoiceNumber"
                type="text"
                className="bg-muted"
                readOnly
                required
                {...register('invoiceNumber', { required: true })}
              />
              <p className="mt-1 text-xs text-foreground/60">Wird automatisch generiert (Format: YYYYMMDDX)</p>
            </FormField>

            <FormField label="Rechnungsdatum" htmlFor="date" required>
              <Input
                id="date"
                type="date"
                required
                {...register('date', { required: true })}
              />
            </FormField>

            <FormField label="Leistungszeitraum" htmlFor="periodDescription" required>
              <Input
                id="periodDescription"
                type="text"
                placeholder="z.B. Januar 2024"
                required
                {...register('periodDescription', { required: true })}
              />
            </FormField>

            <FormField label="Steuersatz (z.B. 0.19)" htmlFor="taxRate" required>
              <Input
                id="taxRate"
                type="number"
                step="0.0001"
                defaultValue="0.19"
                required
                {...register('taxRate', { required: true })}
              />
            </FormField>

            <div className="flex gap-2">
              <Button variant="primary" type="submit">
                Rechnung erstellen
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setSelectedClient('');
                  reset();
                }}
                type="button"
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Rechnungen</h2>
        {invoices.length === 0 ? (
          <p className="text-foreground/70">Noch keine Rechnungen erstellt. Beginnen Sie mit der Erfassung von Zeiteinträgen und erstellen Sie dann Ihre erste Rechnung.</p>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded border border-border bg-background p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link className="font-semibold text-accent hover:underline" href={`/invoices/${invoice.id}`}>
                      {invoice.invoiceNumber}
                    </Link>
                    {invoice.sentAt ? (
                      <span className="rounded border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                        Versendet {formatDate(invoice.sentAt)}
                      </span>
                    ) : (
                      <span className="rounded border border-foreground/20 bg-foreground/5 px-2 py-1 text-xs font-medium text-foreground/70">
                        Entwurf
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-foreground/70">
                    Datum: {formatDate(invoice.invoiceDate)} | Zeitraum: {invoice.periodDescription}
                  </p>
                  <p className="text-sm text-foreground">
                    Gesamt: {formatPrice(invoice.total)}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 gap-2">
                  {!invoice.sentAt && (
                    <Button
                      variant="primary"
                      disabled={sending === invoice.id}
                      onClick={() => onSend(invoice.id)}
                      type="button"
                    >
                      {sending === invoice.id ? 'Wird versendet...' : 'Versenden'}
                    </Button>
                  )}
                  <button
                    className="rounded border-2 border-red-500 bg-transparent px-4 py-2 font-mono text-sm uppercase tracking-wider text-red-600 transition-all hover:bg-red-500 hover:text-white"
                    onClick={() => onDelete(invoice.id)}
                    type="button"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
};
