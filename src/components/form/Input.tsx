import React, { FC, HTMLProps } from 'react';

export const Input: FC<HTMLProps<HTMLInputElement>> = ({
  id, name, value, ref,
}) => (
  <input
    id={id}
    name={name}
    value={value}
    ref={ref}
  />
);
