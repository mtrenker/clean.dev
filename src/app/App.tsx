import React, { FC, StrictMode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { Layout } from '../common/components/Layout';

const theme = createTheme({ palette: { mode: 'dark' } });

export const App: FC = () => (
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
