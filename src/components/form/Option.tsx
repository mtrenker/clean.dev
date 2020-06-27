import React, { FC, HTMLProps } from 'react';

export const Option: FC<HTMLProps<HTMLOptionElement>> = ({ children, value }) => (
  <option value={value}>{children}</option>
);
