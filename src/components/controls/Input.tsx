import React, { FC, HTMLProps } from 'react';
import { css } from '@emotion/react';

interface InputProps extends HTMLProps<HTMLInputElement> {
  register?: any;
}

const inputCss = css`
  width: 100%;
`;

export const Input: FC<InputProps> = ({
  id, name, register, placeholder,
}) => (
  <input
    css={inputCss}
    id={id}
    name={name}
    ref={register}
    placeholder={placeholder}
  />
);
