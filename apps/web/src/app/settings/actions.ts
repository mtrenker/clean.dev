'use server';

import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import type { Settings, UpdateSettings } from '@cleandev/pm';

async function getSettings(): Promise<Settings | null> {
  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  return adapter.getSettings();
}

export async function updateSettingsAction(data: UpdateSettings) {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  return adapter.updateSettings(data);
}
