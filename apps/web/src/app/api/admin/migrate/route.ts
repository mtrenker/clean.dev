import { auth } from 'auth';
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import * as schema from '@cleandev/pm';

export async function POST(): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Datenbank nicht konfiguriert (DATABASE_URL fehlt)' },
        { status: 500 }
      );
    }

    // Run migrations
    const pool = getPool();
    const db = drizzle(pool, { schema });

    // Resolve migrations folder path - go up from apps/web to workspace root, then to packages/pm/drizzle
    const migrationsFolder = path.resolve(process.cwd(), '../..', 'packages/pm/drizzle');

    console.log('Running migrations from:', migrationsFolder);
    await migrate(db, { migrationsFolder });

    return NextResponse.json({
      success: true,
      message: 'Migrationen erfolgreich ausgeführt',
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    );
  }
}
