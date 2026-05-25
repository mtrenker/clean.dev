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
    title: intl.formatMessage({ id: 'privacy.metadata.title' }),
    description: intl.formatMessage({ id: 'privacy.metadata.description' }),
    alternates: { canonical: '/privacy' },
  };
};

const PrivacyPage = async () => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });
  const isGerman = locale === 'de';

  const documentLabel = isGerman ? 'Dokument' : 'Document';
  const documentType = isGerman ? 'Datenschutzinformationen' : 'Privacy information';
  const updatedLabel = isGerman ? 'Stand' : 'Updated';
  const controllerLabel = isGerman ? 'Verantwortlicher' : 'Controller';
  const contentLabel = isGerman ? 'Inhalt' : 'Contents';
  const relatedLabel = isGerman ? 'Auch relevant' : 'Related';
  const noCookies = isGerman ? 'keine Tracking-Cookies' : 'no tracking cookies';
  const emailOnly = isGerman ? 'Kontakt per E-Mail' : 'contact by email';

  const sections = [
    intl.formatMessage({ id: 'privacy.controller.heading' }),
    intl.formatMessage({ id: 'privacy.contactForm.heading' }),
    intl.formatMessage({ id: 'privacy.reviewFlow.heading' }),
    intl.formatMessage({ id: 'privacy.hosting.heading' }),
    intl.formatMessage({ id: 'privacy.rights.heading' }),
    intl.formatMessage({ id: 'privacy.authority.heading' }),
  ];

  return (
    <SiteShell>
      <SiteSection className="py-10 md:py-14">
        <SiteContainer className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <Eyebrow tone="muted">{isGerman ? 'Rechtliches / Datenschutz' : 'Legal / Privacy'}</Eyebrow>
            <h1 className="mt-6 max-w-4xl text-[clamp(2.8rem,6vw,5rem)] font-medium leading-[0.94] tracking-[-0.055em] text-[var(--site-ink)]">
              {intl.formatMessage({ id: 'privacy.heading' })}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--site-ink-sec)] md:text-xl">
              {intl.formatMessage({ id: 'privacy.subtitle' })}
            </p>
          </div>

          <Card className="border-l-4 border-l-[var(--site-green)] p-5">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{documentLabel}</p>
            <p className="mt-2 text-xl font-medium tracking-[-0.02em] text-[var(--site-ink)]">{documentType}</p>
            <dl className="mt-5 grid gap-3 border-t border-dashed border-[var(--site-rule)] pt-4 font-mono text-xs leading-6">
              <div>
                <dt className="uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{updatedLabel}</dt>
                <dd className="text-[var(--site-ink)]">April 2026</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{controllerLabel}</dt>
                <dd className="text-[var(--site-ink)]">Martin Trenker</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-dashed border-[var(--site-rule)] pt-4">
              <span className="rounded-[2px] border border-[var(--site-green)] px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--site-green)]">{noCookies}</span>
              <span className="rounded-[2px] border border-[var(--site-ink-faint)] px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--site-ink-mute)]">{emailOnly}</span>
            </div>
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
                <Link className="mt-2 inline-flex text-sm font-medium text-[var(--site-ink)] hover:text-[var(--site-rust)]" href="/imprint">
                  {intl.formatMessage({ id: 'imprint.heading' })}
                </Link>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <LegalCard meta="01" title={intl.formatMessage({ id: 'privacy.controller.heading' })}>
              <div className="space-y-1">
                <p className="font-semibold text-[var(--site-ink)]">Martin Trenker</p>
                <address className="not-italic">
                  <p>Philipp-Loewenfeld-Str. 63</p>
                  <p>80339 München</p>
                  <p>{intl.formatMessage({ id: 'imprint.country' })}</p>
                </address>
                <p className="pt-1">
                  <strong>{intl.formatMessage({ id: 'privacy.contact.email' })}</strong>{' '}
                  <a href="mailto:info@clean.dev">info@clean.dev</a>
                </p>
              </div>
            </LegalCard>

            <LegalCard meta="02" title={intl.formatMessage({ id: 'privacy.contactForm.heading' })}>
              <div className="space-y-3">
                <p>
                  {intl.formatMessage({ id: 'privacy.contactForm.p1.beforeLink' })}{' '}
                  <Link href="/contact">{intl.formatMessage({ id: 'privacy.contactForm.link' })}</Link>{' '}
                  {intl.formatMessage({ id: 'privacy.contactForm.p1.afterLink' })}
                </p>
                <p>{intl.formatMessage({ id: 'privacy.contactForm.p2' })}</p>
                <p><strong>{intl.formatMessage({ id: 'privacy.contactForm.recipient' })}</strong> {intl.formatMessage({ id: 'privacy.contactForm.recipientValue' }, { provider: intl.formatMessage({ id: 'privacy.contactForm.provider' }) })}</p>
                <p><strong>{intl.formatMessage({ id: 'privacy.contactForm.legalBasis' })}</strong> {intl.formatMessage({ id: 'privacy.contactForm.legalBasisValue' })}</p>
                <p><strong>{intl.formatMessage({ id: 'privacy.contactForm.retention' })}</strong> {intl.formatMessage({ id: 'privacy.contactForm.retentionValue' })}</p>
              </div>
            </LegalCard>

            <LegalCard meta="03" title={intl.formatMessage({ id: 'privacy.reviewFlow.heading' })}>
              <div className="space-y-3">
                <p>{intl.formatMessage({ id: 'privacy.reviewFlow.p1' })}</p>
                <p>{intl.formatMessage({ id: 'privacy.reviewFlow.p2' })}</p>
                <p>{intl.formatMessage({ id: 'privacy.reviewFlow.p3' })}</p>
                <p><strong>{intl.formatMessage({ id: 'privacy.reviewFlow.recipient' })}</strong> {intl.formatMessage({ id: 'privacy.reviewFlow.recipientValue' }, { provider: intl.formatMessage({ id: 'privacy.contactForm.provider' }) })}</p>
                <p><strong>{intl.formatMessage({ id: 'privacy.reviewFlow.legalBasis' })}</strong> {intl.formatMessage({ id: 'privacy.reviewFlow.legalBasisValue' })}</p>
                <p><strong>{intl.formatMessage({ id: 'privacy.reviewFlow.retention' })}</strong> {intl.formatMessage({ id: 'privacy.reviewFlow.retentionValue' })}</p>
                <p className="text-xs leading-6 text-[var(--site-ink-mute)]">{intl.formatMessage({ id: 'privacy.reviewFlow.linkedinNote' })}</p>
              </div>
            </LegalCard>

            <LegalCard meta="04" title={intl.formatMessage({ id: 'privacy.hosting.heading' })}>
              <div className="space-y-3">
                <p>{intl.formatMessage({ id: 'privacy.hosting.p1' }, { provider: intl.formatMessage({ id: 'privacy.hosting.providerPlaceholder' }) })}</p>
                <p>{intl.formatMessage({ id: 'privacy.hosting.p2' })}</p>
                <p>{intl.formatMessage({ id: 'privacy.hosting.p3' }, { retention: intl.formatMessage({ id: 'privacy.hosting.retention' }) })}</p>
                <p><strong>{intl.formatMessage({ id: 'privacy.hosting.legalBasis' })}</strong> {intl.formatMessage({ id: 'privacy.hosting.legalBasisValue' })}</p>
              </div>
            </LegalCard>

            <LegalCard meta="05" title={intl.formatMessage({ id: 'privacy.rights.heading' })}>
              <div className="space-y-3">
                <p>{intl.formatMessage({ id: 'privacy.rights.intro' })}</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>{intl.formatMessage({ id: 'privacy.rights.access' })}</li>
                  <li>{intl.formatMessage({ id: 'privacy.rights.rectification' })}</li>
                  <li>{intl.formatMessage({ id: 'privacy.rights.erasure' })}</li>
                  <li>{intl.formatMessage({ id: 'privacy.rights.restriction' })}</li>
                  <li>{intl.formatMessage({ id: 'privacy.rights.portability' })}</li>
                  <li>{intl.formatMessage({ id: 'privacy.rights.object' })}</li>
                </ul>
                <p>{intl.formatMessage({ id: 'privacy.rights.contact' })} <a href="mailto:info@clean.dev">info@clean.dev</a></p>
              </div>
            </LegalCard>

            <LegalCard meta="06" title={intl.formatMessage({ id: 'privacy.authority.heading' })}>
              <div className="space-y-3">
                <p>{intl.formatMessage({ id: 'privacy.authority.p1' })}</p>
                <address className="not-italic">
                  <p className="font-medium text-[var(--site-ink)]">{intl.formatMessage({ id: 'privacy.authority.name' })}</p>
                  <p>Promenade 27</p>
                  <p>91522 Ansbach</p>
                  <p><a href="https://www.lda.bayern.de" rel="noopener noreferrer" target="_blank">www.lda.bayern.de</a></p>
                </address>
              </div>
            </LegalCard>

            <section className="rounded-[6px] border border-dashed border-[var(--site-rule)] bg-[var(--site-panel-deep)] p-5">
              <p className="text-xs leading-6 text-[var(--site-ink-mute)]">
                {intl.formatMessage({ id: 'privacy.updated.prefix' })}{' '}
                {intl.formatMessage({ id: 'privacy.updated.body' }, {
                  link: (chunks) => <Link href="/imprint" className="text-[var(--site-rust)] hover:underline">{chunks}</Link>,
                })}
              </p>
            </section>
          </div>
        </SiteContainer>
      </SiteSection>
    </SiteShell>
  );
};

export default PrivacyPage;
