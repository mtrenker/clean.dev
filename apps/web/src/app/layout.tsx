import type { PropsWithChildren } from 'react';
import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'clean.dev',
  description: 'clean code, clean work, clean mind.',
}

const RootLayout: React.FC<PropsWithChildren> = ({children}) => (
  <html lang="en">
    <body className={inter.className}>
      <header className="container mx-auto p-4 print:hidden">
        <nav className="grid grid-cols-[1fr_auto] items-center gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-20">
          <div>
            <Link className="text-3xl font-bold" href="/">
              cd
            </Link>
          </div>
          <ul className="flex flex-1 gap-10">
            <li>
              <Link className="text-base font-semibold leading-6 text-gray-900" href="/">
                About
              </Link>
            </li>
            <li>
              <Link className="text-base font-semibold leading-6 text-gray-900" href="/blog">
                Blog
              </Link>
            </li>
            <li>
              <Link className="text-base font-semibold leading-6 text-gray-900" href="/imprint">
                Imprint
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      {children}
      <footer className="container mx-auto mt-10 p-6">
        <p className="text-center text-xs leading-5 text-gray-500">
          {`© ${new Date().getFullYear()} Martin Trenker`}
        </p>
      </footer>
    </body>
  </html>
);

export default RootLayout;
