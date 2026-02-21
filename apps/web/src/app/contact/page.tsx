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
    <main className="bg-background py-12 md:py-16">
      <Container size="narrow" className="px-6">
        <div className="space-y-8">
          <header className="border-b border-border pb-6">
            <Heading as="h1" variant="display" className="mb-2 text-5xl text-foreground">
              {intl.formatMessage({ id: 'contact.heading' })}
            </Heading>
            <p className="mt-2 text-sm text-muted-foreground">
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
