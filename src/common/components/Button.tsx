/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef } from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';

export const Button: React.FC<ButtonProps> = forwardRef((props, ref) => (
  <MuiButton {...props} ref={ref} />
));
