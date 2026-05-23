import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { Card, PageHero, SiteContainer, SiteSection, SiteShell } from '@/components/site/public-design';
import { ContactForm } from './contact-form';
import { getLocale, loadMessages } from '@/lib/locale';

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = getLocale(await headers(), await cookies());
  return {
    title: locale === 'de' ? 'Kontakt | clean.dev' : 'Contact | clean.dev',
    description:
      locale === 'de'
        ? 'Schreiben Sie Martin Trenker eine Nachricht.'
        : 'Send a message to Martin Trenker.',
  };
};

const ContactPage = async () => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  const contextItems = [
    intl.formatMessage({ id: 'contact.context.response' }),
    intl.formatMessage({ id: 'contact.context.process' }),
    intl.formatMessage({ id: 'contact.context.selectivity' }),
  ];

  return (
    <SiteShell>
      <PageHero
        eyebrow={intl.formatMessage({ id: 'home.hero.label' })}
        title={intl.formatMessage({ id: 'contact.heading' })}
        lead={intl.formatMessage({ id: 'contact.lead' })}
      />

      <SiteSection border={false}>
        <SiteContainer className="grid gap-10 lg:grid-cols-[24rem_1fr]">
          <aside className="space-y-4">
            <Card className="p-6">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#d96e3f]">
                {intl.formatMessage({ id: 'contact.context.heading' })}
              </p>
              <ol className="mt-5 space-y-5">
                {contextItems.map((item, index) => (
                  <li key={item} className="grid grid-cols-[2rem_1fr] gap-3 text-sm leading-6 text-[#c4bda9]">
                    <span className="font-mono text-xs text-[#7eaf6a]">0{index + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-6">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#8a8474]">
                {locale === 'de' ? 'Direkt' : 'Direct'}
              </p>
              <a href="mailto:info@clean.dev" className="mt-3 block text-lg font-medium text-[#ede7d4] transition hover:text-[#d96e3f]">
                info@clean.dev
              </a>
            </Card>
          </aside>

          <ContactForm />
        </SiteContainer>
      </SiteSection>
    </SiteShell>
  );
};

export default ContactPage;
