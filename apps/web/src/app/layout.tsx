import type { PropsWithChildren } from 'react';
import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import Script from 'next/script';
import { auth, signIn, signOut } from 'auth';
import { UserMenu } from '@/components/user-menu';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'clean.dev',
  description: 'clean code, clean work, clean mind.',
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
      <body className={inter.className}>
        <header className="container mx-auto p-4 print:hidden">
          <nav className="flex items-center justify-between">
            <div>
              <Link className="text-3xl font-bold" href="/">
                cd
              </Link>
            </div>
            <div className="flex items-center gap-10">
              <ul className="flex flex-wrap gap-4 md:gap-10">
                <li>
                  <Link className="text-base font-semibold leading-6 text-gray-900" href="/">
                    About
                  </Link>
                </li>
                <li>
                  <Link className="text-base font-semibold leading-6 text-gray-900" href="/imprint">
                    Imprint
                  </Link>
                </li>
              </ul>
              {session && <UserMenu session={session} />}
            </div>
          </nav>
        </header>
        {children}
        <footer className="container mx-auto mt-10 p-6 print:hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs leading-5 text-gray-500">
              {`© ${new Date().getFullYear()} Martin Trenker`}
            </p>
            <div>
              {session ? (
                <form action={async () => {
                  'use server';
                  await signOut();
                }}>
                  <button className="text-xs text-gray-500 hover:text-gray-700" type="submit">
                    Logout
                  </button>
                </form>
              ) : (
                <form action={async () => {
                  'use server';
                  await signIn('github');
                }}>
                  <button className="text-xs text-gray-500 hover:text-gray-700" type="submit">
                    Login
                  </button>
                </form>
              )}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;
