import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

export async function GET(): Promise<NextResponse> {
  try {
    // Check database connectivity (only if DATABASE_URL is set)
    if (process.env.DATABASE_URL) {
      const dbReady = await testConnection();
      if (!dbReady) {
        return NextResponse.json(
          {
            status: 'not ready',
            timestamp: new Date().toISOString(),
            reason: 'database not ready'
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        status: 'ready',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
