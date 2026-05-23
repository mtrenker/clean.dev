import type { Metadata } from 'next';
import Link from 'next/link';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { LegalCard, PageHero, SiteContainer, SiteSection, SiteShell } from '@/components/site/public-design';
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
    alternates: { canonical: '/imprint' },
  };
};

const ImprintPage = async () => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  return (
    <SiteShell>
      <PageHero
        eyebrow={locale === 'de' ? 'Rechtliches' : 'Legal'}
        title={intl.formatMessage({ id: 'imprint.heading' })}
        lead={intl.formatMessage({ id: 'imprint.subtitle' })}
      />

      <SiteSection border={false}>
        <SiteContainer narrow className="space-y-5">
          <LegalCard title={intl.formatMessage({ id: 'imprint.serviceProvider.heading' })}>
            <address className="space-y-1 not-italic">
              <p className="font-semibold text-[#ede7d4]">Martin Trenker</p>
              <p>Philipp-Loewenfeld-Str. 63</p>
              <p>80339 München</p>
              <p>{intl.formatMessage({ id: 'imprint.country' })}</p>
            </address>
          </LegalCard>

          <LegalCard title={intl.formatMessage({ id: 'imprint.contact.heading' })}>
            <address className="space-y-2 not-italic">
              <p>
                <strong>{intl.formatMessage({ id: 'imprint.contact.email' })}</strong>{' '}
                <a href="mailto:info@clean.dev">info@clean.dev</a>
              </p>
              <p>
                <strong>{intl.formatMessage({ id: 'imprint.contact.form' })}</strong>{' '}
                <Link href="/contact">clean.dev/contact</Link>
              </p>
            </address>
          </LegalCard>

          <LegalCard title={intl.formatMessage({ id: 'imprint.vat.heading' })}>
            <p>
              <strong>{intl.formatMessage({ id: 'imprint.vat.label' })}</strong><br />
              <span className="font-mono text-lg text-[#ede7d4]">DE262621028</span>
            </p>
          </LegalCard>

          <LegalCard title={intl.formatMessage({ id: 'imprint.responsible.heading' })}>
            <p>
              <strong>{intl.formatMessage({ id: 'imprint.responsible.label' })}</strong><br />
              Martin Trenker<br />
              Philipp-Loewenfeld-Str. 63<br />
              80339 München
            </p>
          </LegalCard>

          <LegalCard title={intl.formatMessage({ id: 'imprint.eu.heading' })}>
            <p>
              {intl.formatMessage({ id: 'imprint.eu.body' })}{' '}
              <a href="https://ec.europa.eu/consumers/odr" rel="noopener noreferrer" target="_blank">https://ec.europa.eu/consumers/odr</a>
              <br />
              {intl.formatMessage({ id: 'imprint.eu.email' })}{' '}
              <a href="mailto:info@clean.dev">info@clean.dev</a>
            </p>
          </LegalCard>

          <LegalCard title={intl.formatMessage({ id: 'imprint.consumer.heading' })}>
            <p>{intl.formatMessage({ id: 'imprint.consumer.body' })}</p>
          </LegalCard>
        </SiteContainer>
      </SiteSection>
    </SiteShell>
  );
};

export default ImprintPage;
