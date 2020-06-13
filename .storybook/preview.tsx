import React, { FC } from "react";
import { addDecorator } from "@storybook/react"
import StoryRouter from 'storybook-react-router';
import { ThemeProvider, } from "emotion-theming";
import { withActions } from "@storybook/addon-actions"
import { withKnobs } from "@storybook/addon-knobs"

import { theme } from "../src/themes/default"
import { GlobalStyle } from "../src/components/layout/GlobalStyle"

addDecorator(StoryRouter());
addDecorator(withActions());
addDecorator(withKnobs());

const withTheme = (storyFn) => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    {storyFn()}
  </ThemeProvider>
)

const Centered: FC = ({ children }) => (
  <div css={{
    display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh',
  }}
  >
    {children}
  </div>
);

const centered = (storyFn) => (
  <Centered>
    {storyFn()}
  </Centered>
)

addDecorator(withTheme);
addDecorator(centered);
