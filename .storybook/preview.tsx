import React, { FC } from "react";
import { addDecorator } from "@storybook/react"
import StoryRouter from 'storybook-react-router';
import { ThemeProvider, } from "emotion-theming";

import { theme } from "../src/themes/default"
import { GlobalStyle } from "../src/components/GlobalStyle";

export const parameters = {
  options: {
    storySort: {
      method: '',
      order: ["Docs", "Components"],
      locales: '',
    },
  },
};

const withTheme = (storyFn) => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    {storyFn()}
  </ThemeProvider>
)

addDecorator(StoryRouter());
addDecorator(withTheme);
