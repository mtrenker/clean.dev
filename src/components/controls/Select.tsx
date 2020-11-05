import React, { HTMLProps, FC } from 'react';

interface SelectProps extends HTMLProps<HTMLSelectElement> {
  inputRef?: any
}

export const Select: FC<SelectProps> = ({
  inputRef, children, onChange, name,
}) => (
  <select name={name} onChange={onChange} ref={inputRef}>{children}</select>
);
