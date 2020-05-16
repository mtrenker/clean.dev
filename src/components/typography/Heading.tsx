import React, { FC } from 'react';
import { css as emotion, SerializedStyles } from '@emotion/core';

export interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  css?: SerializedStyles;
}

export const Heading: FC<HeadingProps> = ({ children, as = 'h1', css }) => {
  const sizes = {
    h1: '6vw',
    h2: '5vw',
    h3: '4vw',
    h4: '3vw',
    h5: '2vw',
    h6: '1vw',
  };

  const heading = emotion`
    font-size: calc(1.5rem + ${sizes[as]});
  `;
  const HeadingElement = as;
  return (
    <HeadingElement css={[heading, css]}>{children}</HeadingElement>
  );
};
