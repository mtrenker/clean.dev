import React, { FC, HTMLProps } from 'react';

export const Input: FC<HTMLProps<HTMLInputElement>> = ({ name, value }) => (
  <input
    name={name}
    value={value}
  />
);
