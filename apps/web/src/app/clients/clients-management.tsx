'use client';

import { useState } from 'react';
import { useForm, type UseFormRegister } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useIntl, type IntlShape } from 'react-intl';
import type { Client } from '@cleandev/pm';
import { createClientAction, updateClientAction, deleteClientAction, type ClientFormData } from './actions';
import {
  Badge,
  EmptyState,
  Input,
  Textarea,
  FormField,
  Button,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';

interface ClientsManagementProps {
  clients: Client[];
}

const numberOrUndefined = (value: string): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getClientDefaults = (client: Client): ClientFormData => {
  const customFields = client.customFields as Record<string, unknown> | undefined;

  return {
    name: client.name,
    address: client.address || undefined,
    vatId: client.vatId || undefined,
    paymentDueDays: client.paymentDueDays || undefined,
    earlyPaymentDiscountRate: client.earlyPaymentDiscountRate || undefined,
    earlyPaymentDueDays: client.earlyPaymentDueDays || undefined,
    email: typeof customFields?.email === 'string' ? customFields.email : undefined,
    orderNumber: typeof customFields?.orderNumber === 'string' ? customFields.orderNumber : undefined,
    department: typeof customFields?.department === 'string' ? customFields.department : undefined,
  };
};

interface ClientFormFieldsProps {
  intl: IntlShape;
  idPrefix: string;
  register: UseFormRegister<ClientFormData>;
}

const ClientFormFields: React.FC<ClientFormFieldsProps> = ({ intl, idPrefix, register }) => {
  return (
    <>
      <FormField label={intl.formatMessage({ id: 'clients.form.name' })} htmlFor={`${idPrefix}-name`} required>
        <Input id={`${idPrefix}-name`} type="text" required {...register('name', { required: true })} />
      </FormField>
      <FormField label={intl.formatMessage({ id: 'clients.form.address' })} htmlFor={`${idPrefix}-address`} required>
        <Textarea id={`${idPrefix}-address`} required rows={3} {...register('address', { required: true })} />
      </FormField>
      <FormField label={intl.formatMessage({ id: 'clients.form.vatId' })} htmlFor={`${idPrefix}-vatId`}>
        <Input id={`${idPrefix}-vatId`} type="text" {...register('vatId')} />
      </FormField>
      <FormField label={intl.formatMessage({ id: 'clients.form.paymentTermDays' })} htmlFor={`${idPrefix}-paymentDueDays`}>
        <Input id={`${idPrefix}-paymentDueDays`} type="number" min="1" {...register('paymentDueDays', { setValueAs: numberOrUndefined })} />
      </FormField>
      <FormField label={intl.formatMessage({ id: 'clients.form.discountDays' })} htmlFor={`${idPrefix}-earlyPaymentDueDays`}>
        <Input id={`${idPrefix}-earlyPaymentDueDays`} type="number" min="1" {...register('earlyPaymentDueDays', { setValueAs: numberOrUndefined })} />
      </FormField>
      <FormField label={intl.formatMessage({ id: 'clients.form.discountRate' })} htmlFor={`${idPrefix}-earlyPaymentDiscountRate`}>
        <Input id={`${idPrefix}-earlyPaymentDiscountRate`} type="number" step="0.0001" {...register('earlyPaymentDiscountRate')} />
      </FormField>
      <FormField label={intl.formatMessage({ id: 'clients.form.email' })} htmlFor={`${idPrefix}-email`}>
        <Input id={`${idPrefix}-email`} type="email" {...register('email')} />
      </FormField>
      <FormField label={intl.formatMessage({ id: 'clients.form.orderNumber' })} htmlFor={`${idPrefix}-orderNumber`}>
        <Input id={`${idPrefix}-orderNumber`} type="text" {...register('orderNumber')} />
      </FormField>
      <FormField label={intl.formatMessage({ id: 'clients.form.department' })} htmlFor={`${idPrefix}-department`}>
        <Input id={`${idPrefix}-department`} type="text" {...register('department')} />
      </FormField>
    </>
  );
};

export const ClientsManagement: React.FC<ClientsManagementProps> = ({ clients }) => {
  const router = useRouter();
  const intl = useIntl();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const {
    register: addRegister,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
  } = useForm<ClientFormData>({ defaultValues: { paymentDueDays: 30 } });

  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
  } = useForm<ClientFormData>();

  const editingClient = editingId ? clients.find((client) => client.id === editingId) : undefined;

  const onAdd = async (data: ClientFormData) => {
    try {
      await createClientAction(data);
      setIsAdding(false);
      resetAdd({ paymentDueDays: 30 });
      router.refresh();
    } catch (error) {
      alert(intl.formatMessage({ id: 'clients.error.create' }));
    }
  };

  const onUpdate = async (data: ClientFormData) => {
    if (!editingId) return;

    try {
      await updateClientAction(editingId, data);
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
      if (editingId === id) {
        setEditingId(null);
      }
      router.refresh();
    } catch (error) {
      alert(intl.formatMessage({ id: 'clients.error.delete' }));
    }
  };

  const startEdit = (client: Client) => {
    setIsAdding(false);
    setEditingId(client.id);
    resetEdit(getClientDefaults(client));
  };

  return (
    <>
      <div className="mb-6">
        <Button
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setIsAdding(true);
            resetAdd({ paymentDueDays: 30 });
          }}
          type="button"
        >
          {intl.formatMessage({ id: 'clients.new' })}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">{intl.formatMessage({ id: 'clients.form.heading' })}</h2>
          <form className="space-y-6" onSubmit={handleAddSubmit(onAdd)}>
            <ClientFormFields idPrefix="add" intl={intl} register={addRegister} />
            <div className="flex gap-2">
              <Button variant="primary" type="submit">
                {intl.formatMessage({ id: 'clients.form.create' })}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsAdding(false);
                  resetAdd({ paymentDueDays: 30 });
                }}
                type="button"
              >
                {intl.formatMessage({ id: 'clients.form.cancel' })}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {editingClient && (
        <Card className="mb-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">{intl.formatMessage({ id: 'clients.form.edit' })}: {editingClient.name}</h2>
          <form className="space-y-6" onSubmit={handleEditSubmit(onUpdate)}>
            <ClientFormFields idPrefix={`edit-${editingClient.id}`} intl={intl} register={editRegister} />
            <div className="flex gap-2">
              <Button variant="primary" type="submit">
                {intl.formatMessage({ id: 'clients.form.save' })}
              </Button>
              <Button variant="secondary" onClick={() => setEditingId(null)} type="button">
                {intl.formatMessage({ id: 'clients.form.cancel' })}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 text-xl font-semibold text-foreground">{intl.formatMessage({ id: 'clients.list.heading' })}</h2>
        {clients.length === 0 ? (
          <EmptyState title={intl.formatMessage({ id: 'clients.list.empty' })} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{intl.formatMessage({ id: 'clients.form.name' })}</TableHead>
                <TableHead>{intl.formatMessage({ id: 'clients.form.paymentTermDays' })}</TableHead>
                <TableHead>{intl.formatMessage({ id: 'clients.form.email' })}</TableHead>
                <TableHead>{intl.formatMessage({ id: 'clients.form.vatId' })}</TableHead>
                <TableHead className="text-right">{intl.formatMessage({ id: 'clients.form.edit' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const customFields = client.customFields as Record<string, unknown> | undefined;
                const email = typeof customFields?.email === 'string' ? customFields.email : undefined;
                const orderNumber = typeof customFields?.orderNumber === 'string' ? customFields.orderNumber : undefined;
                const department = typeof customFields?.department === 'string' ? customFields.department : undefined;

                return (
                  <TableRow key={client.id}>
                    <TableCell>
                      <p className="font-semibold text-foreground">{client.name}</p>
                      {client.address && <p className="text-sm text-muted-foreground">{client.address}</p>}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{intl.formatMessage({ id: 'clients.info.paymentTerm' }, { days: client.paymentDueDays || 30 })}</p>
                      {client.earlyPaymentDiscountRate && client.earlyPaymentDueDays && (
                        <p className="text-sm text-muted-foreground">
                          {intl.formatMessage({
                            id: 'clients.info.discount',
                          }, {
                            rate: (parseFloat(client.earlyPaymentDiscountRate) * 100).toFixed(2),
                            days: client.earlyPaymentDueDays,
                          })}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm text-foreground">
                        {email ? <p>{email}</p> : <p className="text-muted-foreground">-</p>}
                        {department && <p className="text-muted-foreground">{intl.formatMessage({ id: 'clients.info.department' }, { department })}</p>}
                        {orderNumber && <p className="text-muted-foreground">{intl.formatMessage({ id: 'clients.info.orderNumber' }, { number: orderNumber })}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.vatId ? (
                        <Badge variant="outline">{client.vatId}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => startEdit(client)} type="button">
                          {intl.formatMessage({ id: 'clients.form.edit' })}
                        </Button>
                        <Button onClick={() => onDelete(client.id)} type="button" variant="destructive">
                          {intl.formatMessage({ id: 'clients.form.delete' })}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
};
