import { Pool } from 'pg';
import type { IProjectManagementAdapter } from './interface';
export * from './interface';
export * from './postgres';
export declare function createAdapter(type: 'postgres', pool: Pool): IProjectManagementAdapter;
//# sourceMappingURL=index.d.ts.map