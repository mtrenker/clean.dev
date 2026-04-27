import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
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

  return (
    <main id="main-content" className="bg-background">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <Section noBorder>
        <Container>
          <div className="max-w-2xl">
            <p className="text-label mb-4 tracking-[0.3em] text-accent">
              {intl.formatMessage({ id: 'home.hero.label' })}
            </p>
            <Heading as="h1" variant="display" className="mb-4 text-5xl md:text-6xl">
              {intl.formatMessage({ id: 'contact.heading' })}
            </Heading>
            <p className="text-xl leading-relaxed text-muted-foreground">
              {intl.formatMessage({ id: 'contact.lead' })}
            </p>
          </div>
        </Container>
      </Section>

      {/* ── Two-column: trust context + form ────────────────────────────────── */}
      <Section>
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">

            {/* Left: what to expect */}
            <aside className="space-y-8">
              <div>
                <h2 className="text-label mb-5 tracking-[0.2em] text-accent">
                  {intl.formatMessage({ id: 'contact.context.heading' })}
                </h2>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <span className="mt-1 shrink-0 font-mono text-sm font-bold text-accent">01</span>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {intl.formatMessage({ id: 'contact.context.response' })}
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <span className="mt-1 shrink-0 font-mono text-sm font-bold text-accent">02</span>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {intl.formatMessage({ id: 'contact.context.process' })}
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <span className="mt-1 shrink-0 font-mono text-sm font-bold text-accent">03</span>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {intl.formatMessage({ id: 'contact.context.selectivity' })}
                    </p>
                  </li>
                </ul>
              </div>

              {/* Divider + direct contact */}
              <div className="border-t border-border pt-6">
                <p className="text-label text-xs text-muted-foreground">
                  {locale === 'de' ? 'Direktkontakt' : 'Direct'}
                </p>
                <a
                  href="mailto:info@clean.dev"
                  className="mt-2 block text-sm text-foreground transition-colors hover:text-accent"
                >
                  info@clean.dev
                </a>
              </div>
            </aside>

            {/* Right: contact form */}
            <div>
              <ContactForm />
            </div>

          </div>
        </Container>
      </Section>

    </main>
  );
};

export default ContactPage;
