import React, { FC, HTMLProps } from 'react';
import { css } from '@emotion/core';

interface TextAreaProps extends HTMLProps<HTMLTextAreaElement> {
  inputRef?: any;
}

const textAreaCss = css`
  width: 100%;
`;

export const TextArea: FC<TextAreaProps> = ({
  id, name, value, inputRef, placeholder,
}) => (
  <textarea
    css={textAreaCss}
    placeholder={placeholder}
    name={name}
    ref={inputRef}
    id={id}
    value={value}
  />
);
