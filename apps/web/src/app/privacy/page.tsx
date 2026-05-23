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

  return (
    <SiteShell>
      <PageHero
        eyebrow={locale === 'de' ? 'Datenschutz' : 'Privacy'}
        title={intl.formatMessage({ id: 'privacy.heading' })}
        lead={intl.formatMessage({ id: 'privacy.subtitle' })}
      />

      <SiteSection border={false}>
        <SiteContainer narrow className="space-y-5">
          <LegalCard title={intl.formatMessage({ id: 'privacy.controller.heading' })}>
            <div className="space-y-1">
              <p className="font-semibold text-[#ede7d4]">Martin Trenker</p>
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

          <LegalCard title={intl.formatMessage({ id: 'privacy.contactForm.heading' })}>
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

          <LegalCard title={intl.formatMessage({ id: 'privacy.reviewFlow.heading' })}>
            <div className="space-y-3">
              <p>{intl.formatMessage({ id: 'privacy.reviewFlow.p1' })}</p>
              <p>{intl.formatMessage({ id: 'privacy.reviewFlow.p2' })}</p>
              <p>{intl.formatMessage({ id: 'privacy.reviewFlow.p3' })}</p>
              <p><strong>{intl.formatMessage({ id: 'privacy.reviewFlow.recipient' })}</strong> {intl.formatMessage({ id: 'privacy.reviewFlow.recipientValue' }, { provider: intl.formatMessage({ id: 'privacy.contactForm.provider' }) })}</p>
              <p><strong>{intl.formatMessage({ id: 'privacy.reviewFlow.legalBasis' })}</strong> {intl.formatMessage({ id: 'privacy.reviewFlow.legalBasisValue' })}</p>
              <p><strong>{intl.formatMessage({ id: 'privacy.reviewFlow.retention' })}</strong> {intl.formatMessage({ id: 'privacy.reviewFlow.retentionValue' })}</p>
              <p className="text-xs text-[#8a8474]">{intl.formatMessage({ id: 'privacy.reviewFlow.linkedinNote' })}</p>
            </div>
          </LegalCard>

          <LegalCard title={intl.formatMessage({ id: 'privacy.hosting.heading' })}>
            <div className="space-y-3">
              <p>{intl.formatMessage({ id: 'privacy.hosting.p1' }, { provider: intl.formatMessage({ id: 'privacy.hosting.providerPlaceholder' }) })}</p>
              <p>{intl.formatMessage({ id: 'privacy.hosting.p2' })}</p>
              <p>{intl.formatMessage({ id: 'privacy.hosting.p3' }, { retention: intl.formatMessage({ id: 'privacy.hosting.retention' }) })}</p>
              <p><strong>{intl.formatMessage({ id: 'privacy.hosting.legalBasis' })}</strong> {intl.formatMessage({ id: 'privacy.hosting.legalBasisValue' })}</p>
            </div>
          </LegalCard>

          <LegalCard title={intl.formatMessage({ id: 'privacy.rights.heading' })}>
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

          <LegalCard title={intl.formatMessage({ id: 'privacy.authority.heading' })}>
            <div className="space-y-3">
              <p>{intl.formatMessage({ id: 'privacy.authority.p1' })}</p>
              <address className="not-italic">
                <p className="font-medium text-[#ede7d4]">{intl.formatMessage({ id: 'privacy.authority.name' })}</p>
                <p>Promenade 27</p>
                <p>91522 Ansbach</p>
                <p><a href="https://www.lda.bayern.de" rel="noopener noreferrer" target="_blank">www.lda.bayern.de</a></p>
              </address>
            </div>
          </LegalCard>

          <section className="border-t border-[#2c2924] pt-4">
            <p className="text-xs leading-6 text-[#8a8474]">
              {intl.formatMessage({ id: 'privacy.updated.prefix' })}{' '}
              {intl.formatMessage({ id: 'privacy.updated.body' }, {
                link: (chunks) => <Link href="/imprint" className="text-[#d96e3f] hover:underline">{chunks}</Link>,
              })}
            </p>
          </section>
        </SiteContainer>
      </SiteSection>
    </SiteShell>
  );
};

export default PrivacyPage;
