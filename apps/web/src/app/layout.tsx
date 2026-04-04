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
import { MobileNav } from '@/components/mobile-nav';
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

  const navItems = [
    { href: '/work', label: intl.formatMessage({ id: 'nav.portfolio' }) },
    { href: '/blog', label: intl.formatMessage({ id: 'nav.blog' }) },
  ];

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
          {/* Skip-to-content — WCAG 2.4.1 */}
          <a href="#main-content" className="skip-to-content">
            Skip to content
          </a>

          <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm print:hidden">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 md:px-12 lg:px-24" aria-label="Main navigation">
              <div>
                <Link className="group flex items-center gap-3 font-serif text-2xl font-bold tracking-tight text-foreground transition-colors hover:text-accent" href="/">
                  <span className="inline-block transition-transform group-hover:scale-110">cd</span>
                  <span className="hidden font-mono text-sm font-normal tracking-wider sm:inline-block">
                    clean.dev
                  </span>
                </Link>
              </div>

              {/* Desktop navigation */}
              <div className="hidden items-center gap-6 md:flex md:gap-10">
                <ul className="flex flex-wrap gap-4 md:gap-8">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        className="text-label text-foreground transition-colors hover:text-accent"
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <LanguageSwitcher currentLocale={locale} />
                {session && <UserMenu session={session} />}
              </div>

              {/* Mobile: language + hamburger */}
              <div className="flex items-center gap-3 md:hidden">
                <LanguageSwitcher currentLocale={locale} />
                {session && <UserMenu session={session} />}
                <MobileNav items={navItems} />
              </div>
            </nav>
          </header>

          <div id="main-content">
            {children}
          </div>

          <footer className="border-t border-border bg-background print:hidden">
            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:px-12 lg:px-24">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                {/* Logo + copyright */}
                <div className="flex flex-col gap-2">
                  <Link href="/" className="font-serif text-lg font-bold tracking-tight text-foreground transition-colors hover:text-accent">
                    cd <span className="font-mono text-xs font-normal tracking-wider">clean.dev</span>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {intl.formatMessage({ id: 'footer.copyright' }, { year: new Date().getFullYear() })}
                  </p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <Link
                    className="text-label text-xs text-muted-foreground transition-colors hover:text-accent"
                    href="/imprint"
                  >
                    {intl.formatMessage({ id: 'nav.legal' })}
                  </Link>
                  {session ? (
                    <>
                      <span className="text-foreground/20" aria-hidden="true">|</span>
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
                      <span className="text-foreground/20" aria-hidden="true">|</span>
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
            </div>
          </footer>
        </IntlProviderWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
