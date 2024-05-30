import React from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  type: string;
}

export const Input: React.FC<InputProps> = ({ name, type, ...rest }) => {
  return (
    <input name={name} type={type} {...rest} />
  );
};
