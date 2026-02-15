'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Invoice, Client, CreateInvoice } from '@cleandev/pm';
import { createInvoiceAction, deleteInvoiceAction, getUninvoicedEntriesAction, getNextInvoiceNumberAction, sendInvoiceAction } from './actions';

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
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => setShowForm(true)}
            type="button"
          >
            Neue Rechnung erstellen
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Neue Rechnung erstellen</h2>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium" htmlFor="clientId">
                Kunde *
              </label>
              <select
                className="mt-1 w-full rounded border p-2"
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
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium" htmlFor="fromDate">
                  Von Datum
                </label>
                <input
                  className="mt-1 w-full rounded border p-2"
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor="toDate">
                  Bis Datum
                </label>
                <input
                  className="mt-1 w-full rounded border p-2"
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                onClick={setPreviousMonth}
                type="button"
              >
                Vormonat
              </button>
              <button
                className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                onClick={setCurrentMonth}
                type="button"
              >
                Aktueller Monat
              </button>
            </div>

            {uninvoicedEntries.length > 0 && (
              <div className="rounded border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">Zeiterfassungen</h3>
                  <button
                    className="text-sm text-blue-600 underline hover:text-blue-800"
                    onClick={toggleAllTimeEntries}
                    type="button"
                  >
                    {selectedTimeEntries.size === uninvoicedEntries.length ? 'Alle abwählen' : 'Alle auswählen'}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
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
                          <tr key={entry.id} className="border-b hover:bg-gray-50">
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
                    <tfoot className="border-t bg-gray-50 font-medium">
                      <tr>
                        <td colSpan={5} className="p-2 text-right">Gesamt ({selectedTimeEntries.size} ausgewählt):</td>
                        <td className="p-2 text-right">{formatPrice(calculateTotal())}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium" htmlFor="invoiceNumber">
                Rechnungsnummer *
              </label>
              <input
                className="mt-1 w-full rounded border bg-gray-100 p-2"
                id="invoiceNumber"
                readOnly
                required
                type="text"
                {...register('invoiceNumber', { required: true })}
              />
              <p className="mt-1 text-xs text-gray-500">Wird automatisch generiert (Format: YYYYMMDDX)</p>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="date">
                Rechnungsdatum *
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                id="date"
                required
                type="date"
                {...register('date', { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="periodDescription">
                Leistungszeitraum *
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                id="periodDescription"
                placeholder="z.B. Januar 2024"
                required
                type="text"
                {...register('periodDescription', { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="taxRate">
                Steuersatz (z.B. 0.19) *
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                defaultValue="0.19"
                id="taxRate"
                required
                step="0.0001"
                type="number"
                {...register('taxRate', { required: true })}
              />
            </div>

            <div className="flex gap-2">
              <button
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                type="submit"
              >
                Rechnung erstellen
              </button>
              <button
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                onClick={() => {
                  setShowForm(false);
                  setSelectedClient('');
                  reset();
                }}
                type="button"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Rechnungen</h2>
        {invoices.length === 0 ? (
          <p>Keine Rechnungen vorhanden.</p>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded border p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link className="font-semibold text-blue-600 hover:underline" href={`/invoices/${invoice.id}`}>
                      {invoice.invoiceNumber}
                    </Link>
                    {invoice.sentAt ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Versendet {formatDate(invoice.sentAt)}
                      </span>
                    ) : (
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        Entwurf
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Datum: {formatDate(invoice.invoiceDate)} | Zeitraum: {invoice.periodDescription}
                  </p>
                  <p className="text-sm">
                    Gesamt: {formatPrice(invoice.total)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!invoice.sentAt && (
                    <button
                      className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:bg-gray-400"
                      disabled={sending === invoice.id}
                      onClick={() => onSend(invoice.id)}
                      type="button"
                    >
                      {sending === invoice.id ? 'Wird versendet...' : 'Versenden'}
                    </button>
                  )}
                  <button
                    className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
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
      </div>
    </>
  );
};
