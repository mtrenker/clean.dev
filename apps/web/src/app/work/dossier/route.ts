import { createIntl } from 'react-intl';
import type { NextRequest } from 'next/server';
import { projects } from '../../projects';
import { DEFAULT_LOCALE, isValidLocale, loadMessages, LOCALE_COOKIE } from '@/lib/locale';
import { buildProjectDossier } from '../project-dossier';

export const GET = async (request: NextRequest): Promise<Response> => {
  const requestedLocale = request.nextUrl.searchParams.get('locale') ?? request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = requestedLocale && isValidLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });
  const dossier = buildProjectDossier(projects, locale, intl);
  const filename = `martin-trenker-project-dossier-${locale}.md`;

  return new Response(dossier, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Language': locale,
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
