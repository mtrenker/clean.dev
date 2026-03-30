import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, recipient_name, recipient_role, engagement_context, token, status, created_at
       FROM testimonial_invitations
       WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    return NextResponse.json({ invitation: result.rows[0] });
  } finally {
    client.release();
  }
}
