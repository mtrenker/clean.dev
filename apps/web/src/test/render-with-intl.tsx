import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import enMessages from '@/messages/en.json';

interface IntlRenderOptions extends Omit<RenderOptions, 'queries'> {
  locale?: 'en' | 'de';
  messages?: Record<string, string>;
}

export const renderWithIntl = (
  ui: React.ReactElement,
  { locale = 'en', messages = enMessages, ...options }: IntlRenderOptions = {},
) => {
  return render(
    <IntlProvider locale={locale} messages={messages}>
      {ui}
    </IntlProvider>,
    options,
  );
};
