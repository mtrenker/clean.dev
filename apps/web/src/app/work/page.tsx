import React from 'react';
import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { projects } from '../projects';
import { getLocale, loadMessages } from '@/lib/locale';
import { PortfolioView } from './portfolio-view';
import { WorkPrintCv } from './print-cv';
import { buildRouteMetadata } from '@/lib/site-metadata';

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = getLocale(await headers(), await cookies());
  return buildRouteMetadata('work', locale);
};

const Home: React.FC = async () => {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);

  return (
    <>
      <PortfolioView
        locale={locale}
        messages={messages as Record<string, string>}
        projects={projects}
      />
      <WorkPrintCv
        locale={locale}
        messages={messages as Record<string, string>}
        projects={projects}
      />
    </>
  );
};

export default Home;
