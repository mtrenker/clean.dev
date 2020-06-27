import React, { HTMLProps, FC } from 'react';

interface SelectProps extends HTMLProps<HTMLSelectElement> {
  inputRef?: any
}

export const Select: FC<SelectProps> = ({ inputRef, children }) => (
  <select ref={inputRef}>{children}</select>
);
