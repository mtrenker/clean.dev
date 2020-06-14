import React, { FC } from "react";
import { addDecorator } from "@storybook/react"
import StoryRouter from 'storybook-react-router';
import { ThemeProvider, } from "emotion-theming";
import { withActions } from "@storybook/addon-actions"
import { withKnobs } from "@storybook/addon-knobs"

import { theme } from "../src/themes/default"
import { GlobalStyle } from "../src/components/layout/GlobalStyle"
import { css } from "@emotion/core";

addDecorator(StoryRouter());
addDecorator(withActions());
addDecorator(withKnobs());

const withTheme = (storyFn) => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    {storyFn()}
  </ThemeProvider>
)

const centeredCss = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: rgba(0,0,0, .2);
  > * {
    background: white;
  }
`;

const Centered: FC = ({ children }) => (
  <div css={centeredCss}>
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
