import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

export async function GET(): Promise<NextResponse> {
  try {
    const checks: Record<string, boolean> = {};

    // Check database connectivity (only if DATABASE_URL is set)
    if (process.env.DATABASE_URL) {
      checks.database = await testConnection();
    }

    const allHealthy = Object.values(checks).every(check => check);

    return NextResponse.json(
      {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        checks
      },
      { status: allHealthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
