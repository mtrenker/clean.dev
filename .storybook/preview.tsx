import React, { FC } from "react";
import { addDecorator } from "@storybook/react"
import { ThemeProvider } from "@emotion/react";

import { GlobalStyle } from "../src/components/GlobalStyle";

const withTheme = (storyFn) => (
  <ThemeProvider theme={{}}>
    <GlobalStyle />
    {storyFn()}
  </ThemeProvider>
)

addDecorator(withTheme);
