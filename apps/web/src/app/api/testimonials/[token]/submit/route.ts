import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { sendEmail } from '@/lib/email';

interface SubmitBody {
  answers?: Record<string, string>;
  consent?: {
    publicWithName?: boolean;
    publicAnonymous?: boolean;
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const body = await request.json() as SubmitBody;
  const { answers = {}, consent = {} } = body;

  const hasSubstantiveAnswer = Object.values(answers).some(
    (v) => typeof v === 'string' && v.trim().length > 0
  );
  if (!hasSubstantiveAnswer) {
    return NextResponse.json(
      { error: 'At least one substantive answer is required' },
      { status: 400 }
    );
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const invResult = await client.query(
      `SELECT id, recipient_name, engagement_context, status
       FROM testimonial_invitations
       WHERE token = $1
       FOR UPDATE`,
      [token]
    );

    if (invResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const invitation = invResult.rows[0] as {
      id: string;
      recipient_name: string;
      engagement_context: string;
      status: string;
    };

    if (invitation.status !== 'pending') {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'This invitation has already been submitted' },
        { status: 409 }
      );
    }

    await client.query(
      `INSERT INTO testimonial_responses (invitation_id, answers)
       VALUES ($1, $2)`,
      [invitation.id, JSON.stringify(answers)]
    );

    const publicWithName = Boolean(consent.publicWithName);
    const publicAnonymous = Boolean(consent.publicAnonymous);
    const privateOnly = !publicWithName && !publicAnonymous;

    await client.query(
      `INSERT INTO testimonial_consent (invitation_id, public_with_name, public_anonymous, private_only)
       VALUES ($1, $2, $3, $4)`,
      [invitation.id, publicWithName, publicAnonymous, privateOnly]
    );

    await client.query(
      `UPDATE testimonial_invitations SET status = 'submitted', updated_at = now() WHERE id = $1`,
      [invitation.id]
    );

    await client.query('COMMIT');

    await notifyOwner(invitation.recipient_name, invitation.engagement_context).catch(
      (err) => console.error('Failed to send testimonial notification email:', err)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function notifyOwner(recipientName: string, engagementContext: string): Promise<void> {
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  if (!notificationEmail) return;

  const adminUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://clean.dev';

  await sendEmail({
    to: notificationEmail,
    subject: 'New testimonial submission received',
    html: `
      <p>A new testimonial has been submitted.</p>
      <p><strong>Respondent:</strong> ${escapeHtml(recipientName)}</p>
      <p><strong>Engagement:</strong> ${escapeHtml(engagementContext)}</p>
      <p><a href="${adminUrl}/admin/testimonials/moderation">Review in admin</a></p>
    `,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
