import React from 'react';
import { NextPage } from 'next';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { ScrollReveal } from '@/components/scroll-reveal';
import { LandingPage } from '@/components/home/landing-page';
import { getLocale, loadMessages } from '@/lib/locale';
import { getSocialProfiles } from '@/lib/social-profiles';

const Page: NextPage = async () => {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });
  const socialLinks = getSocialProfiles(intl);

  return (
    <ScrollReveal>
      <LandingPage intl={intl} socialLinks={socialLinks} />
    </ScrollReveal>
  );
};

export default Page;
