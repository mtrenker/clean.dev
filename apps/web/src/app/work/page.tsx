import React from 'react';
import { headers, cookies } from 'next/headers';
import { projects } from '../projects';
import { getLocale, loadMessages } from '@/lib/locale';
import { PortfolioView } from './portfolio-view';

const Home: React.FC = async () => {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);

  return (
    <PortfolioView
      locale={locale}
      messages={messages as Record<string, string>}
      projects={projects}
    />
  );
};

export default Home;
