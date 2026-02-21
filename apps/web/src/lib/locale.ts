import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export type Locale = 'en' | 'de';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'de'];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const isValidLocale = (value: string): value is Locale =>
  SUPPORTED_LOCALES.includes(value as Locale);

/**
 * Determine the active locale from cookie → Accept-Language header → default.
 */
export const getLocale = (
  _headers: Pick<ReadonlyHeaders, 'get'>,
  cookies: Pick<ReadonlyRequestCookies, 'get'>,
): Locale => {
  // Only respect an explicit manual selection (cookie). Default to English.
  const cookieValue = cookies.get(LOCALE_COOKIE)?.value;
  if (cookieValue && isValidLocale(cookieValue)) {
    return cookieValue;
  }

  return DEFAULT_LOCALE;
};

type Messages = Record<string, string>;

const messageCache: Partial<Record<Locale, Messages>> = {};

/**
 * Load and cache the JSON message bundle for a given locale.
 */
export const loadMessages = async (locale: Locale): Promise<Messages> => {
  if (messageCache[locale]) {
    return messageCache[locale]!;
  }
  // Dynamic import so Next.js bundles them correctly
  const messages: Messages = (await import(`../messages/${locale}.json`)).default;
  messageCache[locale] = messages;
  return messages;
};
