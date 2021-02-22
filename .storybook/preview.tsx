import React, { FC } from "react";
import { addDecorator } from "@storybook/react"
import StoryRouter from 'storybook-react-router';
import { ThemeProvider } from "@emotion/react";

import { defaultTheme } from "../src/themes/default"
import { GlobalStyle } from "../src/components/layout/GlobalStyle";

export const parameters = {
  a11y: {
    element: '#root',
    config: {},
    options: {},
    manual: true,
  },
  options: {
    storySort: {
      method: '',
      order: ["Docs", "Components"],
      locales: '',
    },
  },
};

const withTheme = (storyFn) => (
  <ThemeProvider theme={defaultTheme}>
    <GlobalStyle />
    {storyFn()}
  </ThemeProvider>
)

addDecorator(StoryRouter());
addDecorator(withTheme);
