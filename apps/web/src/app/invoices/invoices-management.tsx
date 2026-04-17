'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useIntl } from 'react-intl';
import type { Invoice, Client, CreateInvoice } from '@cleandev/pm';
import { createInvoiceAction, deleteInvoiceAction, getUninvoicedEntriesAction, getNextInvoiceNumberAction, sendInvoiceAction } from './actions';
import {
  Badge,
  EmptyState,
  Input,
  Select,
  FormField,
  Button,
  Card,
  Link,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';

interface InvoicesManagementProps {
  invoices: Invoice[];
  clients: Client[];
}

interface UninvoicedEntry {
  id: string;
  date: Date;
  description: string;
  hours: string;
  hourlyRate: string;
}

export const InvoicesManagement: React.FC<InvoicesManagementProps> = ({ invoices, clients }) => {
  const router = useRouter();
  const intl = useIntl();

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(intl.locale, { dateStyle: 'short' }).format(date);
  };

  const formatPrice = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(intl.locale, { style: 'currency', currency: 'EUR' }).format(num);
  };

  const [showForm, setShowForm] = useState(false);
  const [uninvoicedEntries, setUninvoicedEntries] = useState<UninvoicedEntry[]>([]);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<Set<string>>(new Set());
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [sending, setSending] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<
    Omit<CreateInvoice, 'timeEntryIds' | 'invoiceDate'> & { date: string }
  >();

  const watchedClientId = watch('clientId');
  const watchedDate = watch('date');

  useEffect(() => {
    if (showForm && !watchedDate) {
      const today = new Date().toISOString().split('T')[0];
      setValue('date', today);
    }
  }, [showForm, watchedDate, setValue]);

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
        const typedEntries = entries as UninvoicedEntry[];
        setUninvoicedEntries(typedEntries);
        setSelectedTimeEntries(new Set(typedEntries.map((entry) => entry.id)));
      });
    } else {
      setUninvoicedEntries([]);
      setSelectedTimeEntries(new Set());
    }
  }, [watchedClientId, fromDate, toDate]);

  const onSubmit = async (
    data: Omit<CreateInvoice, 'timeEntryIds' | 'invoiceDate'> & { date: string }
  ) => {
    try {
      if (selectedTimeEntries.size === 0) {
        alert(intl.formatMessage({ id: 'invoices.error.noEntries' }));
        return;
      }

      const timeEntryIds = Array.from(selectedTimeEntries);
      await createInvoiceAction({
        ...data,
        timeEntryIds,
      });
      setShowForm(false);
      setSelectedTimeEntries(new Set());
      reset();
      router.refresh();
    } catch (error) {
      alert(intl.formatMessage({ id: 'invoices.error.create' }));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm(intl.formatMessage({ id: 'invoices.confirm.delete' }))) return;
    try {
      await deleteInvoiceAction(id);
      router.refresh();
    } catch (error) {
      alert(intl.formatMessage({ id: 'invoices.error.delete' }));
    }
  };

  const onSend = async (id: string) => {
    if (!confirm(intl.formatMessage({ id: 'invoices.confirm.send' }))) return;
    setSending(id);
    try {
      const result = await sendInvoiceAction(id);
      if (result.success) {
        alert(intl.formatMessage({ id: 'invoices.success.sent' }));
        router.refresh();
      } else {
        alert(intl.formatMessage({ id: 'invoices.error.generic' }, { error: result.error }));
      }
    } catch (error) {
      alert(intl.formatMessage({ id: 'invoices.error.send' }));
    } finally {
      setSending(null);
    }
  };

  const handleClientSelect = (clientId: string) => {
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
      setSelectedTimeEntries(new Set(uninvoicedEntries.map((entry) => entry.id)));
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

    const monthYear = new Intl.DateTimeFormat(intl.locale, { month: 'long', year: 'numeric' }).format(firstDay);
    setValue('periodDescription', monthYear);
  };

  const setPreviousMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(lastDay.toISOString().split('T')[0]);

    const monthYear = new Intl.DateTimeFormat(intl.locale, { month: 'long', year: 'numeric' }).format(firstDay);
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
            {intl.formatMessage({ id: 'invoices.new' })}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">{intl.formatMessage({ id: 'invoices.form.heading' })}</h2>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <FormField label={intl.formatMessage({ id: 'invoices.form.client' })} htmlFor="clientId" required>
              <Select
                id="clientId"
                required
                {...register('clientId', { required: true })}
                onChange={(e) => handleClientSelect(e.target.value)}
              >
                <option value="">{intl.formatMessage({ id: 'invoices.form.placeholder' })}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label={intl.formatMessage({ id: 'invoices.form.dateFrom' })} htmlFor="fromDate">
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </FormField>
              <FormField label={intl.formatMessage({ id: 'invoices.form.dateTo' })} htmlFor="toDate">
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </FormField>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={setPreviousMonth}
                type="button"
              >
                {intl.formatMessage({ id: 'invoices.form.lastMonth' })}
              </Button>
              <Button
                variant="secondary"
                onClick={setCurrentMonth}
                type="button"
              >
                {intl.formatMessage({ id: 'invoices.form.thisMonth' })}
              </Button>
            </div>

            {uninvoicedEntries.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium text-foreground">{intl.formatMessage({ id: 'invoices.form.entries.heading' })}</h3>
                  <button
                    className="text-sm text-accent underline hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={toggleAllTimeEntries}
                    type="button"
                  >
                    {selectedTimeEntries.size === uninvoicedEntries.length
                      ? intl.formatMessage({ id: 'invoices.form.deselectAll' })
                      : intl.formatMessage({ id: 'invoices.form.selectAll' })}
                  </button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <label className="sr-only" htmlFor="select-all-entries">
                          {intl.formatMessage({ id: 'invoices.form.selectAll' })}
                        </label>
                        <input
                          id="select-all-entries"
                          checked={selectedTimeEntries.size === uninvoicedEntries.length && uninvoicedEntries.length > 0}
                          aria-checked={
                            selectedTimeEntries.size === 0
                              ? false
                              : selectedTimeEntries.size === uninvoicedEntries.length
                              ? true
                              : 'mixed'
                          }
                          onChange={toggleAllTimeEntries}
                          type="checkbox"
                        />
                      </TableHead>
                      <TableHead>{intl.formatMessage({ id: 'invoices.form.col.date' })}</TableHead>
                      <TableHead>{intl.formatMessage({ id: 'invoices.form.col.description' })}</TableHead>
                      <TableHead className="text-right">{intl.formatMessage({ id: 'invoices.form.col.hours' })}</TableHead>
                      <TableHead className="text-right">{intl.formatMessage({ id: 'invoices.form.col.rate' })}</TableHead>
                      <TableHead className="text-right">{intl.formatMessage({ id: 'invoices.form.col.amount' })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uninvoicedEntries.map((entry) => {
                      const amount = parseFloat(entry.hours) * parseFloat(entry.hourlyRate);
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <label className="sr-only" htmlFor={`entry-${entry.id}`}>
                              {intl.formatMessage({ id: 'invoices.form.col.description' })}: {entry.description}
                            </label>
                            <input
                              id={`entry-${entry.id}`}
                              checked={selectedTimeEntries.has(entry.id)}
                              onChange={() => toggleTimeEntry(entry.id)}
                              type="checkbox"
                            />
                          </TableCell>
                          <TableCell>{formatDate(entry.date)}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell className="text-right">{entry.hours}h</TableCell>
                          <TableCell className="text-right">{formatPrice(entry.hourlyRate)}</TableCell>
                          <TableCell className="text-right">{formatPrice(amount)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="text-right" colSpan={5}>{intl.formatMessage({ id: 'invoices.form.total' }, { count: selectedTimeEntries.size })}</TableCell>
                      <TableCell className="text-right">{formatPrice(calculateTotal())}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            )}

            <FormField label={intl.formatMessage({ id: 'invoices.form.number' })} htmlFor="invoiceNumber" required>
              <Input
                id="invoiceNumber"
                type="text"
                className="bg-muted"
                readOnly
                required
                {...register('invoiceNumber', { required: true })}
              />
              <p className="mt-1 text-xs text-muted-foreground">{intl.formatMessage({ id: 'invoices.form.number.hint' })}</p>
            </FormField>

            <FormField label={intl.formatMessage({ id: 'invoices.form.invoiceDate' })} htmlFor="date" required>
              <Input
                id="date"
                type="date"
                required
                {...register('date', { required: true })}
              />
            </FormField>

            <FormField label={intl.formatMessage({ id: 'invoices.form.period' })} htmlFor="periodDescription" required>
              <Input
                id="periodDescription"
                type="text"
                placeholder={intl.formatMessage({ id: 'invoices.form.period.placeholder' })}
                required
                {...register('periodDescription', { required: true })}
              />
            </FormField>

            <FormField label={intl.formatMessage({ id: 'invoices.form.taxRate' })} htmlFor="taxRate" required>
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
                {intl.formatMessage({ id: 'invoices.form.submit' })}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  reset();
                }}
                type="button"
              >
                {intl.formatMessage({ id: 'invoices.form.cancel' })}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 text-xl font-semibold text-foreground">{intl.formatMessage({ id: 'invoices.list.heading' })}</h2>
        {invoices.length === 0 ? (
          <EmptyState title={intl.formatMessage({ id: 'invoices.list.empty' })} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{intl.formatMessage({ id: 'invoices.list.col.number' })}</TableHead>
                <TableHead>{intl.formatMessage({ id: 'invoices.list.col.date' })}</TableHead>
                <TableHead>{intl.formatMessage({ id: 'invoices.list.col.period' })}</TableHead>
                <TableHead>{intl.formatMessage({ id: 'invoices.list.col.total' })}</TableHead>
                <TableHead>{intl.formatMessage({ id: 'invoices.list.col.status' })}</TableHead>
                <TableHead className="text-right">{intl.formatMessage({ id: 'invoices.list.col.actions' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Link className="font-semibold" href={`/invoices/${invoice.id}`} variant="inline">
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                  <TableCell>{invoice.periodDescription}</TableCell>
                  <TableCell>{formatPrice(invoice.total)}</TableCell>
                  <TableCell>
                    {invoice.sentAt ? (
                      <Badge variant="success">
                        {intl.formatMessage({ id: 'invoices.list.sent' }, { date: formatDate(invoice.sentAt) })}
                      </Badge>
                    ) : (
                      <Badge variant="warning">{intl.formatMessage({ id: 'invoices.list.draft' })}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {!invoice.sentAt && (
                        <Button
                          variant="primary"
                          disabled={sending === invoice.id}
                          onClick={() => onSend(invoice.id)}
                          type="button"
                        >
                          {sending === invoice.id
                            ? intl.formatMessage({ id: 'invoices.send.sending' })
                            : intl.formatMessage({ id: 'invoices.send.button' })}
                        </Button>
                      )}
                      <Button
                        onClick={() => onDelete(invoice.id)}
                        type="button"
                        variant="destructive"
                      >
                        {intl.formatMessage({ id: 'invoices.delete.button' })}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
};
