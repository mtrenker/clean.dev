'use client';

import { IntlProvider } from 'react-intl';

interface IntlProviderWrapperProps {
  locale: string;
  messages: Record<string, string>;
  children: React.ReactNode;
}

export const IntlProviderWrapper: React.FC<IntlProviderWrapperProps> = ({
  locale,
  messages,
  children,
}) => (
  <IntlProvider locale={locale} messages={messages} defaultLocale="en">
    {children}
  </IntlProvider>
);
