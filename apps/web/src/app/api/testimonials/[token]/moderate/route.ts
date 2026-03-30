import { auth } from 'auth';
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

type ModerateAction = 'approve' | 'keep_private' | 'decline';

interface ModerateBody {
  action?: ModerateAction;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await params;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const body = await request.json() as ModerateBody;
  const { action } = body;

  const allowedActions: ModerateAction[] = ['approve', 'keep_private', 'decline'];
  if (!action || !allowedActions.includes(action)) {
    return NextResponse.json(
      { error: `action must be one of: ${allowedActions.join(', ')}` },
      { status: 400 }
    );
  }

  const statusMap: Record<ModerateAction, string> = {
    approve: 'approved',
    keep_private: 'submitted',
    decline: 'declined',
  };

  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE testimonial_invitations
       SET status = $1, updated_at = now()
       WHERE token = $2
       RETURNING id, status`,
      [statusMap[action], token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    return NextResponse.json({ invitation: result.rows[0] });
  } finally {
    client.release();
  }
}
