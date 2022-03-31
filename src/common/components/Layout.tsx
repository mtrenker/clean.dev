import { Box } from '@mui/system';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const Layout: React.VFC = () => (
  <Box>
    <Header />
    <Box sx={{
      '@media screen': {
        paddingY: 10,
      },
    }}
    >
      <Outlet />
    </Box>
  </Box>
);
