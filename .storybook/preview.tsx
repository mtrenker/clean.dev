import React, { FC } from "react";
import { addDecorator } from "@storybook/react"
import { ThemeProvider } from "@emotion/react";

import { defaultTheme } from "../src/themes/default"
import { GlobalStyle } from "../src/components/layout/GlobalStyle";

const withTheme = (storyFn) => (
  <ThemeProvider theme={defaultTheme}>
    <GlobalStyle />
    {storyFn()}
  </ThemeProvider>
)

addDecorator(withTheme);
