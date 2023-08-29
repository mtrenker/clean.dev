import React, { PropsWithChildren } from 'react'
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
      <nav className='container mx-auto'>
        <ul className='flex justify-between'>
          <li>
            <Link href="/">
              Home
            </Link>
          </li>
          <li>
            <Link href="/imprint">
              Imprint
            </Link>
          </li>
        </ul>
      </nav>
      {children}
    </body>
  </html>
);

export default RootLayout;
