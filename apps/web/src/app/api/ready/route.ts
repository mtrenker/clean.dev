import { NextResponse } from 'next/server';

export function GET(): NextResponse {
  try {
    // Add any readiness checks here (database connectivity, external services, etc.)
    // For now, we'll just check if the application is ready to serve requests

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
