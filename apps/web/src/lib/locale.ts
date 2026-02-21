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
  headers: Pick<ReadonlyHeaders, 'get'>,
  cookies: Pick<ReadonlyRequestCookies, 'get'>,
): Locale => {
  // 1. Explicit cookie overrides everything
  const cookieValue = cookies.get(LOCALE_COOKIE)?.value;
  if (cookieValue && isValidLocale(cookieValue)) {
    return cookieValue;
  }

  // 2. Parse Accept-Language header (first tag only, e.g. "de-DE,de;q=0.9" → "de")
  const acceptLanguage = headers.get('accept-language') ?? '';
  const primaryTag = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase() ?? '';
  if (isValidLocale(primaryTag)) {
    return primaryTag;
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
