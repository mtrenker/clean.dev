import { Pool } from 'pg';
import { PostgresAdapter } from './postgres';
import type { IProjectManagementAdapter } from './interface';

export * from './interface';
export * from './postgres';

export function createAdapter(type: 'postgres', pool: Pool): IProjectManagementAdapter {
  switch (type) {
    case 'postgres':
      return new PostgresAdapter(pool);
    default:
      throw new Error(`Unknown adapter type: ${type}`);
  }
}
