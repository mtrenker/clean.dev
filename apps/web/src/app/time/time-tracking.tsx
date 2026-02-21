'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import type { Client, TimeEntry, CreateTimeEntry } from '@cleandev/pm';
import { createTimeEntryAction, deleteTimeEntryAction } from './actions';
import { Input, Textarea, Select, FormField, Button, Card } from '@/components/ui';

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'short' }).format(date);
};

const formatPrice = (hours: string, rate: string): string => {
  const amount = parseFloat(hours) * parseFloat(rate);
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

interface TimeTrackingProps {
  clients: Client[];
  timeEntries: TimeEntry[];
  defaultRate: string;
}

export const TimeTracking: React.FC<TimeTrackingProps> = ({ clients, timeEntries, defaultRate }) => {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Omit<CreateTimeEntry, 'date'> & { date: string }>();

  const onSubmit = async (data: Omit<CreateTimeEntry, 'date'> & { date: string }) => {
    try {
      await createTimeEntryAction(data);
      setShowForm(false);
      reset();
      router.refresh();
    } catch (error) {
      alert('Fehler beim Erstellen der Zeiterfassung');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Zeiterfassung wirklich löschen?')) return;
    try {
      await deleteTimeEntryAction(id);
      router.refresh();
    } catch (error) {
      alert('Fehler beim Löschen der Zeiterfassung');
    }
  };

  const handleClientFilter = (clientId: string) => {
    setSelectedClient(clientId || null);
    const url = new URL(window.location.href);
    if (clientId) {
      url.searchParams.set('clientId', clientId);
    } else {
      url.searchParams.delete('clientId');
    }
    router.push(url.pathname + url.search);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        {!showForm && (
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            type="button"
          >
            Neue Zeiterfassung
          </Button>
        )}
      </div>

      <div className="mb-6">
        <FormField label="Nach Kunde filtern:" htmlFor="filterClient">
          <Select
            id="filterClient"
            className="max-w-md"
            onChange={(e) => handleClientFilter(e.target.value)}
            value={selectedClient || ''}
          >
            <option value="">Alle Kunden</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Neue Zeiterfassung</h2>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Kunde" htmlFor="clientId" required>
              <Select
                id="clientId"
                required
                {...register('clientId', { required: true })}
              >
                <option value="">Bitte wählen...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Datum" htmlFor="date" required>
              <Input
                id="date"
                type="date"
                required
                {...register('date', { required: true })}
              />
            </FormField>

            <FormField label="Stunden" htmlFor="hours" required>
              <Input
                id="hours"
                type="number"
                step="0.25"
                required
                {...register('hours', { required: true })}
              />
            </FormField>

            <FormField label="Stundensatz (EUR)" htmlFor="hourlyRate" required>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                defaultValue={defaultRate}
                required
                {...register('hourlyRate', { required: true })}
              />
            </FormField>

            <FormField label="Beschreibung" htmlFor="description" required>
              <Textarea
                id="description"
                required
                rows={3}
                {...register('description', { required: true })}
              />
            </FormField>

            <div className="flex gap-2">
              <Button variant="primary" type="submit">
                Erstellen
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
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
        <h2 className="mb-4 text-xl font-semibold text-foreground">Zeiterfassungen</h2>
        {timeEntries.length === 0 ? (
          <p className="text-foreground/70">Noch keine Zeiterfassungen vorhanden. Erstellen Sie Ihren ersten Eintrag über die Schaltfläche oben.</p>
        ) : (
          <div className="space-y-4">
            {timeEntries.map((entry) => {
              const client = clients.find((c) => c.id === entry.clientId);
              return (
                <div key={entry.id} className="flex items-center justify-between rounded border border-border bg-background p-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{client?.name}</p>
                    <p className="text-sm text-foreground/70">{formatDate(entry.date)}</p>
                    <p className="text-sm text-foreground/90">{entry.description}</p>
                    <p className="text-sm text-foreground/80">
                      {entry.hours} Stunden × {formatPrice('1', entry.hourlyRate)} = {formatPrice(entry.hours, entry.hourlyRate)}
                    </p>
                    {entry.invoiceId && (
                      <span className="mt-1 inline-block rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        Berechnet
                      </span>
                    )}
                  </div>
                  <button
                    className="ml-4 shrink-0 rounded border-2 border-red-500 bg-transparent px-4 py-2 font-mono text-sm uppercase tracking-wider text-red-600 transition-all hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!entry.invoiceId}
                    onClick={() => onDelete(entry.id)}
                    type="button"
                  >
                    Löschen
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
};
