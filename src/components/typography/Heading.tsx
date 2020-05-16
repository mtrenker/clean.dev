import React, { FC } from 'react';
import { css } from '@emotion/core';

export interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  type?: 'page-title';
}

export const heading = css``;

const pageTitle = css`
  font-size: calc(1rem + 1vw);
  color: #AAA;
`;

const sizes = {
  h1: '6vw',
  h2: '5vw',
  h3: '4vw',
  h4: '3vw',
  h5: '2vw',
  h6: '1vw',
};

const types = {
  'page-title': pageTitle,
};

export const Heading: FC<HeadingProps> = ({ children, as = 'h1', type }) => {
  const fontSize = css`
    font-size: calc(1.5rem + ${sizes[as]});
  `;
  const HeadingElement = as;
  const typeCss = types[type];
  return (
    <HeadingElement css={[heading, fontSize, typeCss]}>{children}</HeadingElement>
  );
};
