'use server';

import { auth } from 'auth';
import { getPool } from '@/lib/db';
import { createAdapter } from '@cleandev/pm';
import type { UpdateSettings } from '@cleandev/pm';
import { requireAdminSession } from '@/lib/authz';

export async function updateSettingsAction(data: UpdateSettings) {
  const session = await auth();
  requireAdminSession(session, '/settings');

  const pool = getPool();
  const adapter = createAdapter('postgres', pool);
  return adapter.updateSettings(data);
}
