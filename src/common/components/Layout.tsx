import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

export const Layout: React.VFC = () => (
    <Box p={2} sx={{color: 'primary.main'}}>
      <Typography variant='h5'>clean.dev</Typography>
      <Typography variant='caption'>currently under construction</Typography>
    </Box>
);
