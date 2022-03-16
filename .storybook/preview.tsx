import React, { FC } from "react";
import { addDecorator } from "@storybook/react"
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme({palette: {mode :"dark"}})

const withTheme = (Story) => (
  <ThemeProvider theme={{}}>
    <CssBaseline />
    <Story />
  </ThemeProvider>
)

addDecorator(withTheme);
