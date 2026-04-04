import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { ContactForm } from './contact-form';
import { getLocale, loadMessages } from '@/lib/locale';

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = getLocale(await headers(), await cookies());
  return {
    title: locale === 'de' ? 'Kontakt | clean.dev' : 'Contact | clean.dev',
    description: locale === 'de' ? 'Senden Sie eine Nachricht an Martin Trenker' : 'Send a message to Martin Trenker',
  };
};

const ContactPage = async () => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  return (
    <main className="bg-background py-12 md:py-20">
      <Container size="narrow" className="px-6">
        <div className="space-y-8">
          <header className="border-b border-border pb-8">
            <p className="text-label mb-3 tracking-[0.3em] text-accent">
              {intl.formatMessage({ id: 'contact.heading' })}
            </p>
            <Heading as="h1" variant="display" className="mb-3 text-4xl text-foreground sm:text-5xl">
              {intl.formatMessage({ id: 'contact.heading' })}
            </Heading>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              {intl.formatMessage({ id: 'contact.lead' })}
            </p>
          </header>

          <ContactForm />
        </div>
      </Container>
    </main>
  );
};

export default ContactPage;
