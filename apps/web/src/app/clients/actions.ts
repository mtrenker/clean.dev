'use server';

import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import type { CreateClient, UpdateClient } from '@cleandev/pm';
import { revalidatePath } from 'next/cache';

export interface ClientFormData {
  name: string;
  address?: string;
  vatId?: string;
  paymentDueDays?: number;
  earlyPaymentDiscountRate?: string;
  earlyPaymentDueDays?: number;
  email?: string;
  orderNumber?: string;
  department?: string;
}

export async function createClientAction(formData: ClientFormData) {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const { email, orderNumber, department, name, address, vatId, paymentDueDays, earlyPaymentDiscountRate, earlyPaymentDueDays } = formData;
  const customFields: Record<string, unknown> = {};
  if (email) customFields.email = email;
  if (orderNumber) customFields.orderNumber = orderNumber;
  if (department) customFields.department = department;

  const data: CreateClient = {
    name,
    address: address || '',
    vatId,
    paymentDueDays: paymentDueDays ?? 30,
    earlyPaymentDiscountRate,
    earlyPaymentDueDays,
    customFields,
  };

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  const client = await adapter.createClient(data);
  revalidatePath('/clients');
  return client;
}

export async function updateClientAction(id: string, formData: ClientFormData) {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const { email, orderNumber, department, name, address, vatId, paymentDueDays, earlyPaymentDiscountRate, earlyPaymentDueDays } = formData;
  const customFields: Record<string, unknown> = {};
  if (email) customFields.email = email;
  if (orderNumber) customFields.orderNumber = orderNumber;
  if (department) customFields.department = department;

  const data: UpdateClient = {
    name,
    address,
    vatId,
    paymentDueDays,
    earlyPaymentDiscountRate,
    earlyPaymentDueDays,
    customFields,
  };

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  const client = await adapter.updateClient(id, data);
  revalidatePath('/clients');
  return client;
}

export async function deleteClientAction(id: string) {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  await adapter.deleteClient(id);
  revalidatePath('/clients');
}
