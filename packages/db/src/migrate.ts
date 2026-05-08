import path from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * Resolve the default migrations folder relative to this source file so that
 * the path works whether the file is executed via `tsx src/migrate.ts` (dev)
 * or from the compiled `dist/migrate.js` (production).
 *
 * Source:  packages/db/src/migrate.ts   → __dirname = .../packages/db/src
 * Compiled: packages/db/dist/migrate.js  → __dirname = .../packages/db/dist
 * Both resolve to packages/db/drizzle.
 */
const DEFAULT_MIGRATIONS_FOLDER = path.resolve(__dirname, '../drizzle');

export async function runMigrations(pool: Pool, migrationsFolder?: string): Promise<void> {
  const folder = migrationsFolder ?? DEFAULT_MIGRATIONS_FOLDER;
  const db = drizzle(pool, { schema });

  console.log('Running migrations from:', folder);
  await migrate(db, { migrationsFolder: folder });
  console.log('Migrations completed successfully');
}

// CLI usage: tsx src/migrate.ts (or node dist/migrate.js)
if (require.main === module) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  runMigrations(pool)
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    })
    .finally(() => {
      pool.end();
    });
}
