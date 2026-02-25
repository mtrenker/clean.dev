import type { PropsWithChildren } from 'react';
import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import Script from 'next/script';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { auth, signIn, signOut } from 'auth';
import { UserMenu } from '@/components/user-menu';
import { IntlProviderWrapper } from '@/components/intl-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { getLocale, loadMessages } from '@/lib/locale';

export const generateMetadata = async (): Promise<Metadata> => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);

  return {
    title: locale === 'de'
      ? 'clean.dev — Software-Berater'
      : 'clean.dev — Software Consultant',
    description: locale === 'de'
      ? '20 Jahre Engineering-Exzellenz. Bessere Software durch Clean Code, echte Agile-Praktiken und strategische KI-Integration.'
      : '20 years of engineering excellence. Building better software through clean code, authentic agile practices, and strategic AI integration.',
  };
};

const RootLayout = async ({children}: PropsWithChildren) => {
  const [session, headerStore, cookieStore] = await Promise.all([
    auth(),
    headers(),
    cookies(),
  ]);

  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  return (
    <html lang={locale}>
      <head>
        <Script
          data-api="https://analytics.pacabytes.io/api/e"
          data-domain="clean.dev"
          src="https://analytics.pacabytes.io/js/script.js" />
      </head>
      <body className="font-sans antialiased">
        <IntlProviderWrapper locale={locale} messages={messages}>
          <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm print:hidden">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12 lg:px-24">
              <div>
                <Link className="group flex items-center gap-3 font-serif text-2xl font-bold tracking-tight text-foreground transition-colors hover:text-accent" href="/">
                  <span className="inline-block transition-transform group-hover:scale-110">cd</span>
                  <span className="hidden font-mono text-sm font-normal tracking-wider sm:inline-block">
                    clean.dev
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-6 md:gap-10">
                <ul className="flex flex-wrap gap-4 md:gap-8">
                  <li>
                    <Link
                      className="text-label text-foreground transition-colors hover:text-accent"
                      href="/work"
                    >
                      {intl.formatMessage({ id: 'nav.portfolio' })}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-label text-foreground transition-colors hover:text-accent"
                      href="/blog"
                    >
                      {intl.formatMessage({ id: 'nav.blog' })}
                    </Link>
                  </li>
                </ul>
                <LanguageSwitcher currentLocale={locale} />
                {session && <UserMenu session={session} />}
              </div>
            </nav>
          </header>
          {children}
          <footer className="border-t border-border bg-background print:hidden">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-12 lg:px-24">
              <p className="text-label text-xs text-muted-foreground">
                {intl.formatMessage({ id: 'footer.copyright' }, { year: new Date().getFullYear() })}
              </p>
              <div className="flex items-center gap-6">
                <Link
                  className="text-label text-xs text-muted-foreground transition-colors hover:text-accent"
                  href="/imprint"
                >
                  {intl.formatMessage({ id: 'nav.legal' })}
                </Link>
                {session ? (
                  <>
                    <span className="text-foreground/40">|</span>
                    <form action={async () => {
                      'use server';
                      await signOut();
                    }}>
                      <button
                        className="text-label text-xs text-muted-foreground transition-colors hover:text-accent"
                        type="submit"
                      >
                        {intl.formatMessage({ id: 'nav.logout' })}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <span className="text-foreground/40">|</span>
                    <form action={async () => {
                      'use server';
                      await signIn('github');
                    }}>
                      <button
                        className="text-label text-xs text-muted-foreground transition-colors hover:text-accent"
                        type="submit"
                      >
                        {intl.formatMessage({ id: 'nav.login' })}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </footer>
        </IntlProviderWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
