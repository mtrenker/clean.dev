import { notFound } from 'next/navigation';
import { getPool } from '@/lib/db';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { TestimonialForm } from './testimonial-form';
import { Card } from '@/components/ui/card';

interface Invitation {
  id: string;
  recipient_name: string;
  recipient_role: string;
  engagement_context: string;
  token: string;
  status: string;
}

const TestimonialPage = async ({
  params,
}: {
  params: Promise<{ token: string }>;
}) => {
  const { token } = await params;

  if (!process.env.DATABASE_URL) {
    return (
      <main className="bg-background py-16">
        <Container className="px-6">
          <Card className="max-w-xl text-center">
            <p className="text-muted-foreground">This feature is not available right now.</p>
          </Card>
        </Container>
      </main>
    );
  }

  const pool = getPool();
  const client = await pool.connect();
  let invitation: Invitation | null = null;
  try {
    const result = await client.query(
      `SELECT id, recipient_name, recipient_role, engagement_context, token, status
       FROM testimonial_invitations
       WHERE token = $1`,
      [token]
    );
    invitation = result.rows[0] as Invitation | undefined ?? null;
  } finally {
    client.release();
  }

  if (!invitation) {
    notFound();
  }

  if (invitation.status === 'submitted' || invitation.status === 'approved' || invitation.status === 'declined') {
    return (
      <main className="bg-background py-16">
        <Container className="px-6">
          <div className="mx-auto max-w-xl">
            <Card className="text-center">
              <div className="py-8">
                <div className="mb-4 text-4xl">✓</div>
                <Heading as="h1" variant="display" className="mb-2 text-3xl text-foreground">
                  Already submitted
                </Heading>
                <p className="text-muted-foreground">
                  This invitation has already been used. Thank you for your feedback.
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-background py-16">
      <Container className="px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <Heading as="h1" variant="display" className="mb-3 text-4xl text-foreground">
              Share your experience
            </Heading>
            <p className="text-lg text-muted-foreground">
              This questionnaire takes under 5 minutes. No account required.
            </p>
          </div>
          <TestimonialForm invitation={invitation} token={token} />
        </div>
      </Container>
    </main>
  );
};

export default TestimonialPage;
