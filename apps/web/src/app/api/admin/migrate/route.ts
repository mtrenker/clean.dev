import { auth } from 'auth';
import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/authz';
import { getPool } from '@/lib/db';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { existsSync } from 'fs';
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

    if (!isAdminSession(session)) {
      return NextResponse.json(
        { error: 'Keine Admin-Berechtigung' },
        { status: 403 }
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

    const migrationCandidates = [
      // Docker/custom-server runtime uses /app as cwd.
      path.resolve(process.cwd(), 'packages/pm/drizzle'),
      // Local Next dev can run from apps/web.
      path.resolve(process.cwd(), '../..', 'packages/pm/drizzle'),
    ];
    const migrationsFolder = migrationCandidates.find((candidate) =>
      existsSync(path.join(candidate, 'meta', '_journal.json')),
    );

    if (!migrationsFolder) {
      return NextResponse.json(
        {
          error: `Migration metadata not found. Checked: ${migrationCandidates.join(', ')}`,
        },
        { status: 500 },
      );
    }

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
