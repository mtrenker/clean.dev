import React, { FC, HTMLProps } from 'react';
import { css } from '@emotion/react';

interface TextAreaProps extends HTMLProps<HTMLTextAreaElement> {
  register?: any;
}

const textAreaCss = css`
  width: 100%;
`;

export const TextArea: FC<TextAreaProps> = ({
  id, name, value, register, placeholder,
}) => (
  <textarea
    css={textAreaCss}
    placeholder={placeholder}
    name={name}
    ref={register}
    id={id}
    value={value}
  />
);
