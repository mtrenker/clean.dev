'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import type { Client, TimeEntry, CreateTimeEntry } from '@cleandev/pm';
import { createTimeEntryAction, deleteTimeEntryAction } from './actions';

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
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => setShowForm(true)}
            type="button"
          >
            Neue Zeiterfassung
          </button>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium" htmlFor="filterClient">
          Nach Kunde filtern:
        </label>
        <select
          className="mt-1 w-full max-w-md rounded border p-2"
          id="filterClient"
          onChange={(e) => handleClientFilter(e.target.value)}
          value={selectedClient || ''}
        >
          <option value="">Alle Kunden</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Neue Zeiterfassung</h2>
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
              >
                <option value="">Bitte wählen...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="date">
                Datum *
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
              <label className="block text-sm font-medium" htmlFor="hours">
                Stunden *
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                id="hours"
                required
                step="0.25"
                type="number"
                {...register('hours', { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="hourlyRate">
                Stundensatz (EUR) *
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                defaultValue={defaultRate}
                id="hourlyRate"
                required
                step="0.01"
                type="number"
                {...register('hourlyRate', { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="description">
                Beschreibung *
              </label>
              <textarea
                className="mt-1 w-full rounded border p-2"
                id="description"
                required
                rows={3}
                {...register('description', { required: true })}
              />
            </div>

            <div className="flex gap-2">
              <button
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                type="submit"
              >
                Erstellen
              </button>
              <button
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                onClick={() => {
                  setShowForm(false);
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
        <h2 className="mb-4 text-xl font-semibold">Zeiterfassungen</h2>
        {timeEntries.length === 0 ? (
          <p>Keine Zeiterfassungen vorhanden.</p>
        ) : (
          <div className="space-y-4">
            {timeEntries.map((entry) => {
              const client = clients.find((c) => c.id === entry.clientId);
              return (
                <div key={entry.id} className="flex items-center justify-between rounded border p-4">
                  <div>
                    <p className="font-semibold">{client?.name}</p>
                    <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                    <p className="text-sm">{entry.description}</p>
                    <p className="text-sm">
                      {entry.hours} Stunden × {formatPrice('1', entry.hourlyRate)} = {formatPrice(entry.hours, entry.hourlyRate)}
                    </p>
                    {entry.invoiceId && <p className="text-sm text-green-600">Berechnet</p>}
                  </div>
                  <button
                    className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
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
      </div>
    </>
  );
};
