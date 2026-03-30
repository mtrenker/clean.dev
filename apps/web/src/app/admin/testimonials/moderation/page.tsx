import { auth } from 'auth';
import { redirect } from 'next/navigation';
import { getPool } from '@/lib/db';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { ModerationList } from './moderation-list';

interface Submission {
  id: string;
  token: string;
  recipient_name: string;
  recipient_role: string;
  engagement_context: string;
  answers: Record<string, string>;
  submitted_at: string;
  public_with_name: boolean;
  public_anonymous: boolean;
}

const ModerationPage = async () => {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin/testimonials/moderation');
  }

  let submissions: Submission[] = [];

  if (process.env.DATABASE_URL) {
    const pool = getPool();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT
           i.id,
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
         WHERE i.status = 'submitted'
         ORDER BY r.submitted_at DESC`
      );
      submissions = result.rows as Submission[];
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
              Testimonial Moderation
            </Heading>
            <p className="text-muted-foreground">
              Review submitted responses and decide what to publish.
            </p>
          </div>
          <Button href="/admin/testimonials/invitations" variant="secondary">
            View Invitations
          </Button>
        </div>
        <ModerationList submissions={submissions} />
      </Container>
    </main>
  );
};

export default ModerationPage;
