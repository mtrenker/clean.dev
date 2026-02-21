import React from 'react';
import clsx from 'clsx';
import { headers, cookies } from 'next/headers';
import { projects } from '../projects';
import { getLocale, loadMessages } from '@/lib/locale';
import { PortfolioView } from './portfolio-view';

const Home: React.FC = async () => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);

  return (
    <main
      className={clsx([
        'mx-auto flex flex-col items-center gap-10',
        'print:mx-14 print:items-start',
      ])}
    >
      <PortfolioView
        locale={locale}
        messages={messages as Record<string, string>}
        projects={projects}
      />
    </main>
  );
};

export default Home;
