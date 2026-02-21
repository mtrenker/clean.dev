'use server';

import { cookies } from 'next/headers';
import { isValidLocale, LOCALE_COOKIE, type Locale } from './locale';

export const setLocale = async (locale: string): Promise<void> => {
  if (!isValidLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60, // 1 year
    sameSite: 'lax',
  });
};
