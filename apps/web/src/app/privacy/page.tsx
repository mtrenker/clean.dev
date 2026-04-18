import type { Metadata } from 'next';
import Link from 'next/link';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { getLocale, loadMessages } from '@/lib/locale';

export const generateMetadata = async (): Promise<Metadata> => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  return {
    title: intl.formatMessage({ id: 'privacy.metadata.title' }),
    description: intl.formatMessage({ id: 'privacy.metadata.description' }),
    alternates: {
      canonical: '/privacy',
    },
  };
};

const PrivacyPage = async () => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  return (
    <main id="main-content" className="bg-background py-12 md:py-16">
      <Container size="narrow" className="px-6">
        <div className="space-y-8">
          <header className="border-b border-border pb-6">
            <Heading as="h1" variant="display" className="mb-2 text-5xl text-foreground">
              {intl.formatMessage({ id: 'privacy.heading' })}
            </Heading>
            <p className="mt-2 text-sm text-muted-foreground">
              {intl.formatMessage({ id: 'privacy.subtitle' })}
            </p>
          </header>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'privacy.controller.heading' })}
            </Heading>
            <Card>
              <div className="space-y-1 text-muted-foreground">
                <p className="font-semibold text-foreground">Martin Trenker</p>
                <address className="not-italic">
                  <p>Philipp-Loewenfeld-Str. 63</p>
                  <p>80339 München</p>
                  <p>{intl.formatMessage({ id: 'imprint.country' })}</p>
                </address>
                <p className="pt-1">
                  <span className="font-medium text-foreground">
                    {intl.formatMessage({ id: 'privacy.contact.email' })}
                  </span>{' '}
                  <a className="text-accent transition-colors hover:underline" href="mailto:info@clean.dev">
                    info@clean.dev
                  </a>
                </p>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'privacy.contactForm.heading' })}
            </Heading>
            <Card>
              <div className="space-y-3 leading-relaxed text-muted-foreground">
                <p>
                  {intl.formatMessage({ id: 'privacy.contactForm.p1.beforeLink' })}{' '}
                  <Link href="/contact" className="text-accent hover:underline">
                    {intl.formatMessage({ id: 'privacy.contactForm.link' })}
                  </Link>{' '}
                  {intl.formatMessage({ id: 'privacy.contactForm.p1.afterLink' })}
                </p>
                <p>{intl.formatMessage({ id: 'privacy.contactForm.p2' })}</p>
                <p>
                  <span className="font-medium text-foreground">
                    {intl.formatMessage({ id: 'privacy.contactForm.recipient' })}
                  </span>{' '}
                  {intl.formatMessage(
                    { id: 'privacy.contactForm.recipientValue' },
                    { provider: intl.formatMessage({ id: 'privacy.contactForm.provider' }) },
                  )}
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    {intl.formatMessage({ id: 'privacy.contactForm.legalBasis' })}
                  </span>{' '}
                  {intl.formatMessage({ id: 'privacy.contactForm.legalBasisValue' })}
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    {intl.formatMessage({ id: 'privacy.contactForm.retention' })}
                  </span>{' '}
                  {intl.formatMessage({ id: 'privacy.contactForm.retentionValue' })}
                </p>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'privacy.reviewFlow.heading' })}
            </Heading>
            <Card>
              <div className="space-y-3 leading-relaxed text-muted-foreground">
                <p>{intl.formatMessage({ id: 'privacy.reviewFlow.p1' })}</p>
                <p>{intl.formatMessage({ id: 'privacy.reviewFlow.p2' })}</p>
                <p>{intl.formatMessage({ id: 'privacy.reviewFlow.p3' })}</p>
                <p>
                  <span className="font-medium text-foreground">
                    {intl.formatMessage({ id: 'privacy.reviewFlow.recipient' })}
                  </span>{' '}
                  {intl.formatMessage(
                    { id: 'privacy.reviewFlow.recipientValue' },
                    { provider: intl.formatMessage({ id: 'privacy.contactForm.provider' }) },
                  )}
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    {intl.formatMessage({ id: 'privacy.reviewFlow.legalBasis' })}
                  </span>{' '}
                  {intl.formatMessage({ id: 'privacy.reviewFlow.legalBasisValue' })}
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    {intl.formatMessage({ id: 'privacy.reviewFlow.retention' })}
                  </span>{' '}
                  {intl.formatMessage({ id: 'privacy.reviewFlow.retentionValue' })}
                </p>
                <p className="text-xs">{intl.formatMessage({ id: 'privacy.reviewFlow.linkedinNote' })}</p>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'privacy.hosting.heading' })}
            </Heading>
            <Card>
              <div className="space-y-3 leading-relaxed text-muted-foreground">
                <p>
                  {intl.formatMessage(
                    { id: 'privacy.hosting.p1' },
                    {
                      provider: intl.formatMessage({ id: 'privacy.hosting.providerPlaceholder' }),
                    },
                  )}
                </p>
                <p>{intl.formatMessage({ id: 'privacy.hosting.p2' })}</p>
                <p>
                  {intl.formatMessage(
                    { id: 'privacy.hosting.p3' },
                    {
                      retention: intl.formatMessage({ id: 'privacy.hosting.retention' }),
                    },
                  )}
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    {intl.formatMessage({ id: 'privacy.hosting.legalBasis' })}
                  </span>{' '}
                  {intl.formatMessage({ id: 'privacy.hosting.legalBasisValue' })}
                </p>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'privacy.rights.heading' })}
            </Heading>
            <Card>
              <div className="space-y-3 leading-relaxed text-muted-foreground">
                <p>{intl.formatMessage({ id: 'privacy.rights.intro' })}</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>{intl.formatMessage({ id: 'privacy.rights.access' })}</li>
                  <li>{intl.formatMessage({ id: 'privacy.rights.rectification' })}</li>
                  <li>{intl.formatMessage({ id: 'privacy.rights.erasure' })}</li>
                  <li>{intl.formatMessage({ id: 'privacy.rights.restriction' })}</li>
                  <li>{intl.formatMessage({ id: 'privacy.rights.portability' })}</li>
                  <li>{intl.formatMessage({ id: 'privacy.rights.object' })}</li>
                </ul>
                <p>
                  {intl.formatMessage({ id: 'privacy.rights.contact' })}{' '}
                  <a className="text-accent transition-colors hover:underline" href="mailto:info@clean.dev">
                    info@clean.dev
                  </a>
                </p>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'privacy.authority.heading' })}
            </Heading>
            <Card>
              <div className="space-y-3 leading-relaxed text-muted-foreground">
                <p>{intl.formatMessage({ id: 'privacy.authority.p1' })}</p>
                <address className="not-italic">
                  <p className="font-medium text-foreground">
                    {intl.formatMessage({ id: 'privacy.authority.name' })}
                  </p>
                  <p>Promenade 27</p>
                  <p>91522 Ansbach</p>
                  <p>
                    <a
                      className="text-accent transition-colors hover:underline"
                      href="https://www.lda.bayern.de"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      www.lda.bayern.de
                    </a>
                  </p>
                </address>
              </div>
            </Card>
          </section>

          <section className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              {intl.formatMessage({ id: 'privacy.updated.prefix' })}{' '}
              {intl.formatMessage(
                { id: 'privacy.updated.body' },
                {
                  link: (chunks) => (
                    <Link href="/imprint" className="text-accent hover:underline">
                      {chunks}
                    </Link>
                  ),
                },
              )}
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
};

export default PrivacyPage;
