/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef } from 'react';
import { TextField as MuiTextField, TextFieldProps } from '@mui/material';

export const TextField: React.VFC<TextFieldProps> = forwardRef((props, ref) => (
  <MuiTextField {...props} ref={ref} />
));
