import { auth } from 'auth';
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, recipient_name, recipient_role, engagement_context, token, status, created_at, updated_at
       FROM testimonial_invitations
       ORDER BY created_at DESC`
    );
    return NextResponse.json({ invitations: result.rows });
  } finally {
    client.release();
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const body = await request.json() as {
    recipientName?: string;
    recipientRole?: string;
    engagementContext?: string;
  };

  const { recipientName, recipientRole, engagementContext } = body;

  if (!recipientName || !recipientRole || !engagementContext) {
    return NextResponse.json(
      { error: 'recipientName, recipientRole, and engagementContext are required' },
      { status: 400 }
    );
  }

  const allowedRoles = ['client', 'manager', 'peer'];
  if (!allowedRoles.includes(recipientRole)) {
    return NextResponse.json(
      { error: `recipientRole must be one of: ${allowedRoles.join(', ')}` },
      { status: 400 }
    );
  }

  const token = randomUUID();
  const pool = getPool();
  const dbClient = await pool.connect();
  try {
    const result = await dbClient.query(
      `INSERT INTO testimonial_invitations (recipient_name, recipient_role, engagement_context, token, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id, recipient_name, recipient_role, engagement_context, token, status, created_at`,
      [recipientName, recipientRole, engagementContext, token]
    );

    const invitation = result.rows[0];
    const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://clean.dev';
    const link = `${baseUrl}/references/${token}`;

    return NextResponse.json({ invitation, link }, { status: 201 });
  } finally {
    dbClient.release();
  }
}
