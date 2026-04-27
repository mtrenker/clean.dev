import type { PropsWithChildren } from 'react';
import React from 'react';
import type { Metadata } from 'next';
import {
  IBM_Plex_Mono,
  Newsreader,
  Source_Sans_3,
} from 'next/font/google';
import './globals.css';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { auth, signIn, signOut } from 'auth';
import { UserMenu } from '@/components/user-menu';
import { IntlProviderWrapper } from '@/components/intl-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import { AppFooter, AppNavigation, Link } from '@/components/ui';
import { getLocale, loadMessages } from '@/lib/locale';
import { getPersonStructuredData, getSocialProfiles } from '@/lib/social-profiles';
import { isAdminSession } from '@/lib/authz';

const fontSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-sans-google',
});

const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-mono-google',
});

const fontSerif = Newsreader({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  display: 'swap',
  variable: '--font-serif-google',
});

export const generateMetadata = async (): Promise<Metadata> => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);

  const title =
    locale === 'de'
      ? 'clean.dev — Embedded Delivery Consulting'
      : 'clean.dev — Embedded Delivery Consulting';
  const description =
    locale === 'de'
      ? 'Hands-on Beratung für Softwareteams: klarere Delivery, bessere technische Entscheidungen und nützliche KI ohne Transformationstheater.'
      : 'Hands-on consulting for software teams: sharper delivery, better technical decisions, and useful AI without transformation theater.';

  return {
    metadataBase: new URL('https://clean.dev'),
    title,
    description,
    openGraph: {
      title,
      description,
      url: 'https://clean.dev',
      siteName: 'clean.dev',
      type: 'website',
      locale: locale === 'de' ? 'de_DE' : 'en_US',
    },
  };
};

const RootLayout = async ({ children }: PropsWithChildren) => {
  const [session, headerStore, cookieStore] = await Promise.all([
    auth(),
    headers(),
    cookies(),
  ]);

  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });
  const socialLinks = getSocialProfiles(intl);

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getPersonStructuredData()),
          }}
        />
      </head>
      <body className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="fixed left-2 top-2 z-[9999] -translate-y-20 rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-lg transition-transform focus:translate-y-0"
        >
          {intl.formatMessage({ id: 'nav.skipToMain' })}
        </a>
        <IntlProviderWrapper locale={locale} messages={messages}>
          <AppNavigation
            brand={(
              <Link className="group flex items-center gap-3 font-mono text-sm font-semibold uppercase tracking-[0.18em]" href="/">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-accent/70 bg-accent/10 text-accent transition-transform group-hover:scale-110">cd</span>
                <span className="hidden sm:inline-block">
                  clean.dev
                </span>
              </Link>
            )}
            items={[
              { href: '/work', label: intl.formatMessage({ id: 'nav.portfolio' }) },
              { href: '/contact', label: intl.formatMessage({ id: 'nav.contact' }) },
            ]}
            socialItems={socialLinks}
            rightSlot={(
              <>
                <LanguageSwitcher currentLocale={locale} />
                {session && isAdminSession(session) && <UserMenu session={session} />}
              </>
            )}
          />
          {children}
          <AppFooter
            actionSlot={
              session ? (
                <>
                  <span aria-hidden="true" className="text-foreground/40">|</span>
                  <form action={async () => {
                    'use server';
                    await signOut();
                  }}>
                    <button
                      className="text-label text-xs text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      type="submit"
                    >
                      {intl.formatMessage({ id: 'nav.logout' })}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <span aria-hidden="true" className="text-foreground/40">|</span>
                  <form action={async () => {
                    'use server';
                    await signIn('github');
                  }}>
                    <button
                      className="text-label text-xs text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      type="submit"
                    >
                      {intl.formatMessage({ id: 'nav.login' })}
                    </button>
                  </form>
                </>
              )
            }
            copyright={intl.formatMessage({ id: 'footer.copyright' }, { year: new Date().getFullYear() })}
            links={[
              { href: '/contact', label: intl.formatMessage({ id: 'nav.contact' }) },
              { href: '/imprint', label: intl.formatMessage({ id: 'nav.legal' }) },
              { href: '/privacy', label: intl.formatMessage({ id: 'nav.privacy' }) },
            ]}
            socialLinks={socialLinks}
          />
        </IntlProviderWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
