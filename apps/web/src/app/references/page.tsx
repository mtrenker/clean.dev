import { getPool } from '@/lib/db';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';

interface TestimonialRow {
  token: string;
  recipient_name: string;
  recipient_role: string;
  engagement_context: string;
  answers: Record<string, string>;
  submitted_at: string;
  public_with_name: boolean;
  public_anonymous: boolean;
}

const QUOTE_KEY_PREFERENCE = ['q3', 'q2', 'q4', 'q5', 'q1', 'q6'];

function pickQuote(answers: Record<string, string>): string {
  for (const key of QUOTE_KEY_PREFERENCE) {
    if (answers[key]?.trim()) return answers[key].trim();
  }
  return '';
}

const ReferencesPage = async () => {
  let testimonials: TestimonialRow[] = [];

  if (process.env.DATABASE_URL) {
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
      testimonials = result.rows as TestimonialRow[];
    } finally {
      client.release();
    }
  }

  return (
    <main className="bg-background">
      <Section className="section-border">
        <Container className="px-6">
          <div className="mb-16 max-w-2xl">
            <Heading as="h1" variant="display" className="mb-4 text-5xl text-foreground">
              References
            </Heading>
            <p className="text-xl leading-relaxed text-muted-foreground">
              Specific, outcome-oriented feedback from clients, managers, and collaborators I have worked with.
            </p>
          </div>

          {testimonials.length === 0 ? (
            <p className="text-muted-foreground">No published references yet.</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {testimonials.map((t) => {
                const quote = pickQuote(t.answers);
                if (!quote) return null;

                const displayName = t.public_with_name ? t.recipient_name : 'Anonymous';
                const period = new Date(t.submitted_at).toLocaleDateString('de-DE', {
                  month: 'long',
                  year: 'numeric',
                });

                return (
                  <figure
                    key={t.token}
                    className="flex flex-col rounded-lg border border-border bg-card p-8"
                  >
                    <blockquote className="flex-1">
                      <p className="font-serif text-lg leading-relaxed text-foreground before:content-['\u201C'] after:content-['\u201D']">
                        {quote}
                      </p>
                    </blockquote>
                    <figcaption className="mt-6 border-t border-border pt-4">
                      <p className="font-medium text-foreground">{displayName}</p>
                      <p className="text-sm capitalize text-muted-foreground">{t.recipient_role}</p>
                      <p className="text-sm text-muted-foreground">{t.engagement_context}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{period}</p>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
};

export default ReferencesPage;
