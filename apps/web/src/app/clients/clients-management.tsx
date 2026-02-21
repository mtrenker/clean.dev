'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useIntl } from 'react-intl';
import type { Client } from '@cleandev/pm';
import { createClientAction, updateClientAction, deleteClientAction, type ClientFormData } from './actions';
import { Input, Textarea, FormField, Button, Card } from '@/components/ui';

interface ClientsManagementProps {
  clients: Client[];
}

export const ClientsManagement: React.FC<ClientsManagementProps> = ({ clients }) => {
  const router = useRouter();
  const intl = useIntl();
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
      alert(intl.formatMessage({ id: 'clients.error.create' }));
    }
  };

  const onUpdate = async (id: string, data: ClientFormData) => {
    try {
      await updateClientAction(id, data);
      setEditingId(null);
      router.refresh();
    } catch (error) {
      alert(intl.formatMessage({ id: 'clients.error.update' }));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm(intl.formatMessage({ id: 'clients.confirm.delete' }))) return;
    try {
      await deleteClientAction(id);
      router.refresh();
    } catch (error) {
      alert(intl.formatMessage({ id: 'clients.error.delete' }));
    }
  };

  return (
    <>
      <div className="mb-4">
        <Button variant="primary" onClick={() => setIsAdding(true)} type="button">
          {intl.formatMessage({ id: 'clients.new' })}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">{intl.formatMessage({ id: 'clients.form.heading' })}</h2>
          <form className="space-y-6" onSubmit={handleSubmit(onAdd)}>
            <FormField label={intl.formatMessage({ id: 'clients.form.name' })} htmlFor="add-name" required>
              <Input id="add-name" type="text" required {...register('name', { required: true })} />
            </FormField>
            <FormField label={intl.formatMessage({ id: 'clients.form.address' })} htmlFor="add-address" required>
              <Textarea id="add-address" required rows={3} {...register('address', { required: true })} />
            </FormField>
            <FormField label={intl.formatMessage({ id: 'clients.form.vatId' })} htmlFor="add-vatId">
              <Input id="add-vatId" type="text" {...register('vatId')} />
            </FormField>
            <FormField label={intl.formatMessage({ id: 'clients.form.paymentTermDays' })} htmlFor="add-paymentDueDays">
              <Input id="add-paymentDueDays" type="number" min="1" defaultValue={30} {...register('paymentDueDays', { setValueAs: (v: string) => { const n = Number(v); return Number.isFinite(n) ? n : undefined; } })} />
            </FormField>
            <FormField label={intl.formatMessage({ id: 'clients.form.discountDays' })} htmlFor="add-earlyPaymentDueDays">
              <Input id="add-earlyPaymentDueDays" type="number" min="1" {...register('earlyPaymentDueDays', { setValueAs: (v: string) => { const n = Number(v); return Number.isFinite(n) ? n : undefined; } })} />
            </FormField>
            <FormField label={intl.formatMessage({ id: 'clients.form.discountRate' })} htmlFor="add-earlyPaymentDiscountRate">
              <Input id="add-earlyPaymentDiscountRate" type="number" step="0.0001" {...register('earlyPaymentDiscountRate')} />
            </FormField>
            <FormField label={intl.formatMessage({ id: 'clients.form.email' })} htmlFor="add-email">
              <Input id="add-email" type="email" {...register('email')} />
            </FormField>
            <FormField label={intl.formatMessage({ id: 'clients.form.orderNumber' })} htmlFor="add-orderNumber">
              <Input id="add-orderNumber" type="text" {...register('orderNumber')} />
            </FormField>
            <FormField label={intl.formatMessage({ id: 'clients.form.department' })} htmlFor="add-department">
              <Input id="add-department" type="text" {...register('department')} />
            </FormField>
            <div className="flex gap-2">
              <Button variant="primary" type="submit">
                {intl.formatMessage({ id: 'clients.form.create' })}
              </Button>
              <Button variant="secondary" onClick={() => { setIsAdding(false); reset(); }} type="button">
                {intl.formatMessage({ id: 'clients.form.cancel' })}
              </Button>
            </div>
          </form>
        </Card>
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
  const intl = useIntl();
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
      <Card>
        <form className="space-y-6" onSubmit={handleSubmit((data) => onUpdate(client.id, data))}>
          <FormField label={intl.formatMessage({ id: 'clients.form.name' })} htmlFor={`edit-name-${client.id}`} required>
            <Input id={`edit-name-${client.id}`} type="text" required {...register('name', { required: true })} />
          </FormField>
          <FormField label={intl.formatMessage({ id: 'clients.form.address' })} htmlFor={`edit-address-${client.id}`} required>
            <Textarea id={`edit-address-${client.id}`} required rows={3} {...register('address', { required: true })} />
          </FormField>
          <FormField label={intl.formatMessage({ id: 'clients.form.vatId' })} htmlFor={`edit-vatId-${client.id}`}>
            <Input id={`edit-vatId-${client.id}`} type="text" {...register('vatId')} />
          </FormField>
          <FormField label={intl.formatMessage({ id: 'clients.form.paymentTermDays' })} htmlFor={`edit-paymentDueDays-${client.id}`}>
            <Input id={`edit-paymentDueDays-${client.id}`} type="number" min="1" {...register('paymentDueDays', { setValueAs: (v: string) => { const n = Number(v); return Number.isFinite(n) ? n : undefined; } })} />
          </FormField>
          <FormField label={intl.formatMessage({ id: 'clients.form.discountDays' })} htmlFor={`edit-earlyPaymentDueDays-${client.id}`}>
            <Input id={`edit-earlyPaymentDueDays-${client.id}`} type="number" min="1" {...register('earlyPaymentDueDays', { setValueAs: (v: string) => { const n = Number(v); return Number.isFinite(n) ? n : undefined; } })} />
          </FormField>
          <FormField label={intl.formatMessage({ id: 'clients.form.discountRate' })} htmlFor={`edit-earlyPaymentDiscountRate-${client.id}`}>
            <Input id={`edit-earlyPaymentDiscountRate-${client.id}`} type="number" step="0.0001" {...register('earlyPaymentDiscountRate')} />
          </FormField>
          <FormField label={intl.formatMessage({ id: 'clients.form.email' })} htmlFor={`edit-email-${client.id}`}>
            <Input id={`edit-email-${client.id}`} type="email" {...register('email')} />
          </FormField>
          <FormField label={intl.formatMessage({ id: 'clients.form.orderNumber' })} htmlFor={`edit-orderNumber-${client.id}`}>
            <Input id={`edit-orderNumber-${client.id}`} type="text" {...register('orderNumber')} />
          </FormField>
          <FormField label={intl.formatMessage({ id: 'clients.form.department' })} htmlFor={`edit-department-${client.id}`}>
            <Input id={`edit-department-${client.id}`} type="text" {...register('department')} />
          </FormField>
          <div className="flex gap-2">
            <Button variant="primary" type="submit">
              {intl.formatMessage({ id: 'clients.form.save' })}
            </Button>
            <Button variant="secondary" onClick={() => onEdit('')} type="button">
              {intl.formatMessage({ id: 'clients.form.cancel' })}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{client.name}</h3>
          {client.address && <p className="mt-2 text-sm text-foreground/80">{client.address}</p>}
          <div className="mt-3 space-y-1">
            {client.vatId && <p className="text-sm text-foreground/70">{intl.formatMessage({ id: 'clients.info.vatId' }, { vatId: client.vatId })}</p>}
            <p className="text-sm text-foreground/70">{intl.formatMessage({ id: 'clients.info.paymentTerm' }, { days: client.paymentDueDays || 30 })}</p>
            {client.earlyPaymentDiscountRate && client.earlyPaymentDueDays && (
              <p className="text-sm text-foreground/70">
                {intl.formatMessage({ id: 'clients.info.discount' }, {
                  rate: (parseFloat(client.earlyPaymentDiscountRate) * 100).toFixed(2),
                  days: client.earlyPaymentDueDays,
                })}
              </p>
            )}
            {email && <p className="text-sm text-foreground/70">{intl.formatMessage({ id: 'clients.info.email' }, { email })}</p>}
            {orderNumber && <p className="text-sm text-foreground/70">{intl.formatMessage({ id: 'clients.info.orderNumber' }, { number: orderNumber })}</p>}
            {department && <p className="text-sm text-foreground/70">{intl.formatMessage({ id: 'clients.info.department' }, { department })}</p>}
          </div>
        </div>
        <div className="ml-4 flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => onEdit(client.id)} type="button">
            {intl.formatMessage({ id: 'clients.form.edit' })}
          </Button>
          <button
            className="rounded border-2 border-red-500 bg-transparent px-4 py-2 font-mono text-sm uppercase tracking-wider text-red-600 transition-all hover:bg-red-500 hover:text-white"
            onClick={() => onDelete(client.id)}
            type="button"
          >
            {intl.formatMessage({ id: 'clients.form.delete' })}
          </button>
        </div>
      </div>
    </Card>
  );
};
