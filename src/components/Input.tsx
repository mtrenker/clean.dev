import React, { FC, HTMLProps } from 'react';
import { css } from '@emotion/core';

interface InputProps extends HTMLProps<HTMLInputElement> {
  register?: any;
}

const inputCss = css`
  width: 100%;
`;

export const Input: FC<InputProps> = ({
  id, name, value, register, placeholder,
}) => (
  <input
    css={inputCss}
    id={id}
    name={name}
    value={value}
    ref={register}
    placeholder={placeholder}
  />
);
