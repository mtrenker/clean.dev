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

const withApolloMockClient = (storyFn) => (
  <ApolloProvider client={mockClient}>
    {storyFn()}
  </ApolloProvider>
)

addDecorator(withTheme);
addDecorator(withApolloMockClient)
