import React, { HTMLProps, FC } from 'react';

interface SelectProps extends HTMLProps<HTMLSelectElement> {
  inputRef?: any
}

export const Select: FC<SelectProps> = ({ inputRef, children, onChange }) => (
  <select onChange={onChange} ref={inputRef}>{children}</select>
);
