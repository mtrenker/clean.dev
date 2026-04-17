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
    title: intl.formatMessage({ id: 'imprint.metadata.title' }),
    description: intl.formatMessage({ id: 'imprint.metadata.description' }),
    alternates: {
      canonical: '/imprint',
    },
  };
};

const ImprintPage = async () => {
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
              {intl.formatMessage({ id: 'imprint.heading' })}
            </Heading>
            <p className="mt-2 text-sm text-muted-foreground">
              {intl.formatMessage({ id: 'imprint.subtitle' })}
            </p>
          </header>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'imprint.serviceProvider.heading' })}
            </Heading>
            <Card>
              <address className="space-y-1 not-italic text-muted-foreground">
                <p className="font-semibold text-foreground">Martin Trenker</p>
                <p>Philipp-Loewenfeld-Str. 63</p>
                <p>80339 München</p>
                <p>{intl.formatMessage({ id: 'imprint.country' })}</p>
              </address>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'imprint.contact.heading' })}
            </Heading>
            <Card>
              <address className="space-y-2 not-italic text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">
                    {intl.formatMessage({ id: 'imprint.contact.email' })}
                  </span>{' '}
                  <a className="text-accent transition-colors hover:underline" href="mailto:info@clean.dev">
                    info@clean.dev
                  </a>
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    {intl.formatMessage({ id: 'imprint.contact.form' })}
                  </span>{' '}
                  <Link className="text-accent transition-colors hover:underline" href="/contact">
                    clean.dev/contact
                  </Link>
                </p>
              </address>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'imprint.vat.heading' })}
            </Heading>
            <Card>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {intl.formatMessage({ id: 'imprint.vat.label' })}
                </span>
                <br />
                <span className="font-mono text-lg">DE262621028</span>
              </p>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'imprint.responsible.heading' })}
            </Heading>
            <Card>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {intl.formatMessage({ id: 'imprint.responsible.label' })}
                </span>
                <br />
                Martin Trenker
                <br />
                Philipp-Loewenfeld-Str. 63
                <br />
                80339 München
              </p>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'imprint.eu.heading' })}
            </Heading>
            <Card>
              <p className="leading-relaxed text-muted-foreground">
                {intl.formatMessage({ id: 'imprint.eu.body' })}{' '}
                <a
                  className="break-all text-accent transition-colors hover:underline"
                  href="https://ec.europa.eu/consumers/odr"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
                <br />
                {intl.formatMessage({ id: 'imprint.eu.email' })}{' '}
                <a className="text-accent transition-colors hover:underline" href="mailto:info@clean.dev">
                  info@clean.dev
                </a>
              </p>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading as="h2" variant="section" className="text-2xl text-foreground">
              {intl.formatMessage({ id: 'imprint.consumer.heading' })}
            </Heading>
            <Card>
              <p className="leading-relaxed text-muted-foreground">
                {intl.formatMessage({ id: 'imprint.consumer.body' })}
              </p>
            </Card>
          </section>
        </div>
      </Container>
    </main>
  );
};

export default ImprintPage;
