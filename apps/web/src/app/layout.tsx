import type { PropsWithChildren } from 'react';
import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import Script from 'next/script';
import { auth, signIn, signOut } from 'auth';
import { UserMenu } from '@/components/user-menu';

export const metadata: Metadata = {
  title: 'clean.dev — Software Consultant',
  description: '20 years of engineering excellence. Building better software through clean code, authentic agile practices, and strategic AI integration.',
}

const RootLayout = async ({children}: PropsWithChildren) => {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <Script
          data-api="https://analytics.pacabytes.io/api/e"
          data-domain="clean.dev"
          src="https://analytics.pacabytes.io/js/script.js" />
      </head>
      <body className="font-sans antialiased">
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
                    href="/me"
                  >
                    Portfolio
                  </Link>
                </li>
              </ul>
              {session && <UserMenu session={session} />}
            </div>
          </nav>
        </header>
        {children}
        <footer className="border-t border-border bg-background print:hidden">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-12 lg:px-24">
            <p className="text-label text-xs text-muted-foreground">
              {`© ${new Date().getFullYear()} Martin Trenker — Building better software`}
            </p>
            <div className="flex items-center gap-6">
              <Link
                className="text-label text-xs text-muted-foreground transition-colors hover:text-accent"
                href="/imprint"
              >
                Legal
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
                      Logout
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
                      Login
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
