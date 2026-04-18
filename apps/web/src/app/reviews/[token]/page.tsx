import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { Container, EmptyState, Heading, Link, Section } from '@/components/ui';
import { getLocale, loadMessages } from '@/lib/locale';
import { ReviewTokenError, verifyReviewToken } from '@/lib/review-links';
import { logger, EVT_INVITE_OPENED, EVT_INVITE_INVALID } from '@/lib/logger';
import { ReviewForm } from './review-form';
import { auth } from 'auth';

type ReviewPageState = 'valid' | 'invalid' | 'expired' | 'disabled';

interface ReviewPageProps {
  params: Promise<{ token: string }>;
}

const getPageStateFromError = (error: unknown): Exclude<ReviewPageState, 'valid'> => {
  if (error instanceof ReviewTokenError) {
    if (error.code === 'EXPIRED') {
      return 'expired';
    }
    if (error.code === 'DISABLED') {
      return 'disabled';
    }
  }

  return 'invalid';
};

const ReviewPage = async ({ params }: ReviewPageProps) => {
  const [{ token }, headerStore, cookieStore, session] = await Promise.all([
    params,
    headers(),
    cookies(),
    auth(),
  ]);


  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  let state: ReviewPageState = 'valid';
  let reviewerContext: ReturnType<typeof verifyReviewToken> | null = null;

  try {
    reviewerContext = verifyReviewToken(token);
    // Log the invite open without including the reviewer's identity.
    logger.info({
      event:        EVT_INVITE_OPENED,
      project_slug: reviewerContext.projectSlug,
    });
  } catch (error) {
    state = getPageStateFromError(error);
    const error_code =
      error instanceof ReviewTokenError ? error.code : 'UNKNOWN';
    logger.warn({ event: EVT_INVITE_INVALID, error_code });
  }

  const callbackPath = `/reviews/${encodeURIComponent(token)}`;

  return (
    <main id="main-content" className="bg-background">
      <Section noBorder>
        <Container size="narrow">
          {state !== 'valid' && (
            <div className="py-8 md:py-16">
              <EmptyState
                title={intl.formatMessage({ id: `review.error.${state}.title` })}
                description={intl.formatMessage({ id: `review.error.${state}.body` })}
                action={(
                  <Link href="/contact" className="btn-secondary inline-block text-sm">
                    {intl.formatMessage({ id: 'review.error.action' })}
                  </Link>
                )}
              />
            </div>
          )}

          {state === 'valid' && reviewerContext && (
            <div className="space-y-8 py-4 md:py-8">
              <div className="space-y-4">
                <p className="text-label tracking-[0.3em] text-accent">
                  {intl.formatMessage({ id: 'review.page.eyebrow' })}
                </p>
                <Heading as="h1" variant="section" className="text-4xl md:text-5xl">
                  {intl.formatMessage({ id: 'review.page.title' })}
                </Heading>
                <p className="text-lg text-muted-foreground">
                  {intl.formatMessage(
                    { id: 'review.page.personalized' },
                    {
                      reviewerName: reviewerContext.name,
                      projectSlug: reviewerContext.projectSlug,
                    },
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {intl.formatMessage({ id: 'review.page.lead' })}
                </p>
              </div>

              <ReviewForm
                token={token}
                callbackPath={callbackPath}
                reviewerEmail={reviewerContext.email}
                reviewerName={reviewerContext.name}
                projectSlug={reviewerContext.projectSlug}
                linkedInUser={session?.user?.provider === 'linkedin'
                  ? {
                      name: session.user.name ?? null,
                      email: session.user.email ?? null,
                      image: session.user.image ?? null,
                    }
                  : null}
              />
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
};

export default ReviewPage;
