import { Box } from '@mui/system';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const Layout: React.VFC = () => (
  <Box>
    <Header />
    <Box marginY={10}>
      <Outlet />
    </Box>
  </Box>
);
