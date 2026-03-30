import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { InvitationsList } from './invitations-list';

interface Invitation {
  id: string;
  recipient_name: string;
  recipient_role: string;
  engagement_context: string;
  token: string;
  status: string;
  created_at: string;
}

const InvitationsPage = async () => {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin/testimonials/invitations');
  }

  let invitations: Invitation[] = [];

  if (process.env.DATABASE_URL) {
    const pool = getPool();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, recipient_name, recipient_role, engagement_context, token, status, created_at
         FROM testimonial_invitations
         ORDER BY created_at DESC`
      );
      invitations = result.rows as Invitation[];
    } finally {
      client.release();
    }
  }

  return (
    <main className="bg-background py-10">
      <Container className="px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Heading as="h1" variant="display" className="mb-2 text-4xl text-foreground">
              Testimonial Invitations
            </Heading>
            <p className="text-muted-foreground">
              Track who has been invited, their status, and resend links.
            </p>
          </div>
          <Button href="/admin/testimonials/invitations/new" variant="primary">
            New Invitation
          </Button>
        </div>
        <InvitationsList invitations={invitations} />
      </Container>
    </main>
  );
};

export default InvitationsPage;
