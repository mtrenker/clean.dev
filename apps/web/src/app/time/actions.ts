'use server';

import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import type { CreateTimeEntry } from '@cleandev/pm';
import { revalidatePath } from 'next/cache';

export async function createTimeEntryAction(data: Omit<CreateTimeEntry, 'date'> & { date: string }) {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);

  const entry = await adapter.createTimeEntry({
    ...data,
    date: new Date(data.date),
  });

  revalidatePath('/time');
  return entry;
}

export async function deleteTimeEntryAction(id: string) {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  await adapter.deleteTimeEntry(id);
  revalidatePath('/time');
}
