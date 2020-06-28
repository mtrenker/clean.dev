import React, { FC } from "react";
import { css } from "@emotion/core";
import StoryRouter from 'storybook-react-router';
import { addDecorator } from "@storybook/react"
import { ThemeProvider, } from "emotion-theming";
import { withActions } from "@storybook/addon-actions"
import { withKnobs } from "@storybook/addon-knobs"
import { ApolloProvider } from "@apollo/react-hooks";

import { theme } from "../src/themes/default"
import { GlobalStyle } from "../src/components/GlobalStyle";
import { mockClient} from "../src/lib/graphql";

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

const borderCss = css`
border: 1px solid #000000;
padding: 10px;
background: #ffffff;
`;

const withApolloMockClient = (storyFn) => (
  <ApolloProvider client={mockClient}>
    {storyFn()}
  </ApolloProvider>
)

addDecorator(withTheme);
addDecorator(withApolloMockClient)
