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

  const navLinks = [
    { href: '/work', label: intl.formatMessage({ id: 'nav.portfolio' }) },
    { href: '/blog', label: intl.formatMessage({ id: 'nav.blog' }) },
    { href: '/contact', label: intl.formatMessage({ id: 'contact.heading' }) },
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
          {/* Skip to content — accessibility */}
          <a className="skip-to-content" href="#main-content">
            Skip to content
          </a>

          <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md print:hidden" role="banner">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12 lg:px-24" aria-label="Main navigation">
              <div>
                <Link className="group flex items-center gap-3 font-serif text-2xl font-extrabold tracking-tight text-foreground transition-colors hover:text-accent" href="/">
                  <span className="inline-block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-2deg]">cd</span>
                  <span className="hidden font-mono text-sm font-normal tracking-wider text-muted-foreground sm:inline-block">
                    clean.dev
                  </span>
                </Link>
              </div>
              {/* Desktop nav */}
              <div className="hidden items-center gap-8 md:flex">
                <ul className="flex gap-8" role="list">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="text-label text-foreground transition-colors hover:text-accent"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="h-5 w-px bg-border" aria-hidden="true" />
                <LanguageSwitcher currentLocale={locale} />
                {session && <UserMenu session={session} />}
              </div>
              {/* Mobile nav */}
              <div className="flex items-center gap-3 md:hidden">
                <LanguageSwitcher currentLocale={locale} />
                {session && <UserMenu session={session} />}
                <MobileNav links={navLinks} />
              </div>
            </nav>
          </header>

          <div id="main-content">
            {children}
          </div>

          <footer className="border-t border-border bg-card print:hidden" role="contentinfo">
            <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-24">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                {/* Brand column */}
                <div className="space-y-3">
                  <Link href="/" className="font-serif text-xl font-extrabold text-foreground transition-colors hover:text-accent">
                    cd <span className="font-mono text-xs font-normal tracking-wider text-muted-foreground">clean.dev</span>
                  </Link>
                  <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                    Progressive Engineering for teams that need safer change at higher speed.
                  </p>
                </div>

                {/* Links column */}
                <nav aria-label="Footer navigation">
                  <ul className="flex flex-wrap gap-x-8 gap-y-3" role="list">
                    {navLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          className="text-label text-xs text-muted-foreground transition-colors hover:text-accent"
                          href={link.href}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        className="text-label text-xs text-muted-foreground transition-colors hover:text-accent"
                        href="/imprint"
                      >
                        {intl.formatMessage({ id: 'nav.legal' })}
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Bottom bar */}
              <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
                <p className="text-label text-xs text-muted-foreground">
                  {intl.formatMessage({ id: 'footer.copyright' }, { year: new Date().getFullYear() })}
                </p>
                <div className="flex items-center gap-6">
                  {session ? (
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
                  ) : (
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
