'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import type { Client } from '@cleandev/pm';
import { createClientAction, updateClientAction, deleteClientAction, type ClientFormData } from './actions';

interface ClientsManagementProps {
  clients: Client[];
}

export const ClientsManagement: React.FC<ClientsManagementProps> = ({ clients }) => {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { register, handleSubmit, reset } = useForm<ClientFormData>();

  const onAdd = async (data: ClientFormData) => {
    try {
      await createClientAction(data);
      setIsAdding(false);
      reset();
      router.refresh();
    } catch (error) {
      alert('Fehler beim Erstellen des Kunden');
    }
  };

  const onUpdate = async (id: string, data: ClientFormData) => {
    try {
      await updateClientAction(id, data);
      setEditingId(null);
      router.refresh();
    } catch (error) {
      alert('Fehler beim Aktualisieren des Kunden');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Kunde wirklich löschen?')) return;
    try {
      await deleteClientAction(id);
      router.refresh();
    } catch (error) {
      alert('Fehler beim Löschen des Kunden');
    }
  };

  return (
    <>
      <div className="mb-4">
        <button
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          onClick={() => setIsAdding(true)}
          type="button"
        >
          Neuer Kunde
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 rounded-lg border bg-gray-50 p-4">
          <h2 className="mb-4 text-xl font-bold">Neuer Kunde</h2>
          <form className="space-y-4" onSubmit={handleSubmit(onAdd)}>
            <div>
              <label className="block text-sm font-medium" htmlFor="add-name">
                Name *
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                id="add-name"
                required
                type="text"
                {...register('name', { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="add-address">
                Adresse *
              </label>
              <textarea
                className="mt-1 w-full rounded border p-2"
                id="add-address"
                required
                rows={3}
                {...register('address', { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="add-vatId">
                USt-ID
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                id="add-vatId"
                type="text"
                {...register('vatId')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="add-paymentDueDays">
                Zahlungsziel (Tage)
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                defaultValue={30}
                id="add-paymentDueDays"
                min="1"
                type="number"
                {...register('paymentDueDays', { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="add-earlyPaymentDueDays">
                Skonto-Zahlungsziel (Tage)
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                id="add-earlyPaymentDueDays"
                min="1"
                type="number"
                {...register('earlyPaymentDueDays', { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="add-earlyPaymentDiscountRate">
                Skonto-Satz (z.B. 0.03 für 3%)
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                id="add-earlyPaymentDiscountRate"
                step="0.0001"
                type="number"
                {...register('earlyPaymentDiscountRate')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="add-email">
                E-Mail
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                id="add-email"
                type="email"
                {...register('email')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="add-orderNumber">
                Bestellnummer
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                id="add-orderNumber"
                type="text"
                {...register('orderNumber')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="add-department">
                Abteilung (z.B. "Rechnungswesen")
              </label>
              <input
                className="mt-1 w-full rounded border p-2"
                id="add-department"
                type="text"
                {...register('department')}
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
                  setIsAdding(false);
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

      <div className="space-y-4">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            isEditing={editingId === client.id}
            onDelete={onDelete}
            onEdit={setEditingId}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </>
  );
};

interface ClientCardProps {
  client: Client;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onUpdate: (id: string, data: ClientFormData) => void;
  onDelete: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, isEditing, onEdit, onUpdate, onDelete }) => {
  const customFields = client.customFields as Record<string, unknown> | undefined;
  const email = customFields?.email as string | undefined;
  const orderNumber = customFields?.orderNumber as string | undefined;
  const department = customFields?.department as string | undefined;

  const { register, handleSubmit } = useForm<ClientFormData>({
    defaultValues: {
      name: client.name,
      address: client.address || undefined,
      vatId: client.vatId || undefined,
      paymentDueDays: client.paymentDueDays,
      earlyPaymentDiscountRate: client.earlyPaymentDiscountRate || undefined,
      earlyPaymentDueDays: client.earlyPaymentDueDays || undefined,
      email: email || undefined,
      orderNumber: orderNumber || undefined,
      department: department || undefined,
    },
  });

  if (isEditing) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow">
        <form className="space-y-4" onSubmit={handleSubmit((data) => onUpdate(client.id, data))}>
          <div>
            <label className="block text-sm font-medium" htmlFor={`edit-name-${client.id}`}>
              Name *
            </label>
            <input
              className="mt-1 w-full rounded border p-2"
              id={`edit-name-${client.id}`}
              required
              type="text"
              {...register('name', { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor={`edit-address-${client.id}`}>
              Adresse *
            </label>
            <textarea
              className="mt-1 w-full rounded border p-2"
              id={`edit-address-${client.id}`}
              required
              rows={3}
              {...register('address', { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor={`edit-vatId-${client.id}`}>
              USt-ID
            </label>
            <input
              className="mt-1 w-full rounded border p-2"
              id={`edit-vatId-${client.id}`}
              type="text"
              {...register('vatId')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor={`edit-paymentDueDays-${client.id}`}>
              Zahlungsziel (Tage)
            </label>
            <input
              className="mt-1 w-full rounded border p-2"
              id={`edit-paymentDueDays-${client.id}`}
              min="1"
              type="number"
              {...register('paymentDueDays', { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor={`edit-earlyPaymentDueDays-${client.id}`}>
              Skonto-Zahlungsziel (Tage)
            </label>
            <input
              className="mt-1 w-full rounded border p-2"
              id={`edit-earlyPaymentDueDays-${client.id}`}
              min="1"
              type="number"
              {...register('earlyPaymentDueDays', { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor={`edit-earlyPaymentDiscountRate-${client.id}`}>
              Skonto-Satz (z.B. 0.03 für 3%)
            </label>
            <input
              className="mt-1 w-full rounded border p-2"
              id={`edit-earlyPaymentDiscountRate-${client.id}`}
              step="0.0001"
              type="number"
              {...register('earlyPaymentDiscountRate')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor={`edit-email-${client.id}`}>
              E-Mail
            </label>
            <input
              className="mt-1 w-full rounded border p-2"
              id={`edit-email-${client.id}`}
              type="email"
              {...register('email')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor={`edit-orderNumber-${client.id}`}>
              Bestellnummer
            </label>
            <input
              className="mt-1 w-full rounded border p-2"
              id={`edit-orderNumber-${client.id}`}
              type="text"
              {...register('orderNumber')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor={`edit-department-${client.id}`}>
              Abteilung (z.B. "Rechnungswesen")
            </label>
            <input
              className="mt-1 w-full rounded border p-2"
              id={`edit-department-${client.id}`}
              type="text"
              {...register('department')}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              type="submit"
            >
              Speichern
            </button>
            <button
              className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
              onClick={() => onEdit('')}
              type="button"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{client.name}</h3>
          {client.address && <p className="text-sm text-gray-600">{client.address}</p>}
          {client.vatId && <p className="text-sm text-gray-600">USt-ID: {client.vatId}</p>}
          <p className="text-sm text-gray-600">Zahlungsziel: {client.paymentDueDays || 30} Tage</p>
          {client.earlyPaymentDiscountRate && client.earlyPaymentDueDays && (
            <p className="text-sm text-gray-600">
              Skonto: {(parseFloat(client.earlyPaymentDiscountRate) * 100).toFixed(2)}% bei Zahlung innerhalb {client.earlyPaymentDueDays} Tage
            </p>
          )}
          {email && <p className="text-sm text-gray-600">E-Mail: {email}</p>}
          {orderNumber && <p className="text-sm text-gray-600">Bestellnummer: {orderNumber}</p>}
          {department && <p className="text-sm text-gray-600">Abteilung: {department}</p>}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
            onClick={() => onEdit(client.id)}
            type="button"
          >
            Bearbeiten
          </button>
          <button
            className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
            onClick={() => onDelete(client.id)}
            type="button"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
};
