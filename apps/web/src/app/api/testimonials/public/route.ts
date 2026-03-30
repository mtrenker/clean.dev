import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(): Promise<NextResponse> {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ testimonials: [] });
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT
         i.token,
         i.recipient_name,
         i.recipient_role,
         i.engagement_context,
         r.answers,
         r.submitted_at,
         c.public_with_name,
         c.public_anonymous
       FROM testimonial_invitations i
       INNER JOIN testimonial_responses r ON r.invitation_id = i.id
       INNER JOIN testimonial_consent c ON c.invitation_id = i.id
       WHERE i.status = 'approved'
         AND (c.public_with_name = true OR c.public_anonymous = true)
       ORDER BY r.submitted_at DESC`
    );
    return NextResponse.json({ testimonials: result.rows });
  } finally {
    client.release();
  }
}
