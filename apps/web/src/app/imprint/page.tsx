import type { Metadata } from 'next';
import Link from 'next/link';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { Card, Eyebrow, LegalCard, SiteContainer, SiteSection, SiteShell } from '@/components/site/public-design';
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
  const isGerman = locale === 'de';

  const documentLabel = isGerman ? 'Dokument' : 'Document';
  const documentType = isGerman ? 'Öffentliche Anbieterkennzeichnung' : 'Public provider information';
  const jurisdictionLabel = isGerman ? 'Rechtsraum' : 'Jurisdiction';
  const contactLabel = isGerman ? 'Direkter Kontakt' : 'Direct contact';
  const relatedLabel = isGerman ? 'Auch relevant' : 'Related';
  const contentLabel = isGerman ? 'Inhalt' : 'Contents';

  const sections = [
    intl.formatMessage({ id: 'imprint.serviceProvider.heading' }),
    intl.formatMessage({ id: 'imprint.contact.heading' }),
    intl.formatMessage({ id: 'imprint.vat.heading' }),
    intl.formatMessage({ id: 'imprint.responsible.heading' }),
    intl.formatMessage({ id: 'imprint.eu.heading' }),
    intl.formatMessage({ id: 'imprint.consumer.heading' }),
  ];

  return (
    <SiteShell>
      <SiteSection className="py-10 md:py-14">
        <SiteContainer className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <Eyebrow tone="muted">{isGerman ? 'Rechtliches / Impressum' : 'Legal / Imprint'}</Eyebrow>
            <h1 className="mt-6 max-w-4xl text-[clamp(2.8rem,6vw,5rem)] font-medium leading-[0.94] tracking-[-0.055em] text-[var(--site-ink)]">
              {intl.formatMessage({ id: 'imprint.heading' })}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--site-ink-sec)] md:text-xl">
              {intl.formatMessage({ id: 'imprint.subtitle' })}
            </p>
          </div>

          <Card className="border-l-4 border-l-[var(--site-rust)] p-5">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{documentLabel}</p>
            <p className="mt-2 text-xl font-medium tracking-[-0.02em] text-[var(--site-ink)]">{documentType}</p>
            <dl className="mt-5 grid gap-3 border-t border-dashed border-[var(--site-rule)] pt-4 font-mono text-xs leading-6">
              <div>
                <dt className="uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{jurisdictionLabel}</dt>
                <dd className="text-[var(--site-ink)]">{intl.formatMessage({ id: 'imprint.country' })}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{contactLabel}</dt>
                <dd><a className="text-[var(--site-rust)] hover:underline" href="mailto:info@clean.dev">info@clean.dev</a></dd>
              </div>
            </dl>
          </Card>
        </SiteContainer>
      </SiteSection>

      <SiteSection border={false} className="pt-0">
        <SiteContainer className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-[6px] border border-[var(--site-rule)] bg-[var(--site-panel)] p-5">
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--site-rust)]">{contentLabel}</p>
              <ol className="mt-4 space-y-3 font-mono text-xs leading-5 text-[var(--site-ink-mute)]">
                {sections.map((section, index) => (
                  <li key={section} className="grid grid-cols-[1.75rem_1fr] gap-2">
                    <span className="text-[var(--site-ink-faint)]">{String(index + 1).padStart(2, '0')}</span>
                    <span>{section}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 border-t border-dashed border-[var(--site-rule)] pt-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{relatedLabel}</p>
                <Link className="mt-2 inline-flex text-sm font-medium text-[var(--site-ink)] hover:text-[var(--site-rust)]" href="/privacy">
                  {intl.formatMessage({ id: 'privacy.heading' })}
                </Link>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <LegalCard meta="01" title={intl.formatMessage({ id: 'imprint.serviceProvider.heading' })}>
              <address className="space-y-1 not-italic">
                <p className="font-semibold text-[var(--site-ink)]">Martin Trenker</p>
                <p>Philipp-Loewenfeld-Str. 63</p>
                <p>80339 München</p>
                <p>{intl.formatMessage({ id: 'imprint.country' })}</p>
              </address>
            </LegalCard>

            <LegalCard meta="02" title={intl.formatMessage({ id: 'imprint.contact.heading' })}>
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

            <LegalCard meta="03" title={intl.formatMessage({ id: 'imprint.vat.heading' })}>
              <p>
                <strong>{intl.formatMessage({ id: 'imprint.vat.label' })}</strong><br />
                <span className="font-mono text-lg text-[var(--site-ink)]">DE262621028</span>
              </p>
            </LegalCard>

            <LegalCard meta="04" title={intl.formatMessage({ id: 'imprint.responsible.heading' })}>
              <p>
                <strong>{intl.formatMessage({ id: 'imprint.responsible.label' })}</strong><br />
                Martin Trenker<br />
                Philipp-Loewenfeld-Str. 63<br />
                80339 München
              </p>
            </LegalCard>

            <LegalCard meta="05" title={intl.formatMessage({ id: 'imprint.eu.heading' })}>
              <p>
                {intl.formatMessage({ id: 'imprint.eu.body' })}{' '}
                <a href="https://ec.europa.eu/consumers/odr" rel="noopener noreferrer" target="_blank">https://ec.europa.eu/consumers/odr</a>
                <br />
                {intl.formatMessage({ id: 'imprint.eu.email' })}{' '}
                <a href="mailto:info@clean.dev">info@clean.dev</a>
              </p>
            </LegalCard>

            <LegalCard meta="06" title={intl.formatMessage({ id: 'imprint.consumer.heading' })}>
              <p>{intl.formatMessage({ id: 'imprint.consumer.body' })}</p>
            </LegalCard>
          </div>
        </SiteContainer>
      </SiteSection>
    </SiteShell>
  );
};

export default ImprintPage;
