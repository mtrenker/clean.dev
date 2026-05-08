/**
 * Re-export the full schema from @cleandev/db.
 *
 * The canonical schema definition now lives in packages/db.  This module is
 * kept as a thin re-export so that existing relative imports inside
 * packages/pm (e.g. `import * as schema from '../db/schema'` in the postgres
 * adapter) continue to work without changes.
 */
export * from '@cleandev/db';
//# sourceMappingURL=schema.d.ts.map