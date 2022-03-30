import React from 'react';
import { Link as MuiLink } from '@mui/material';
import { Link as RouterLink, LinkProps } from 'react-router-dom';

export const Link: React.FC<LinkProps> = ({ children, ...props }) => (
  <MuiLink component={RouterLink} {...props}>
    {children}
  </MuiLink>
);
