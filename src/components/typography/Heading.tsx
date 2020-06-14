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
  h1: '3vw',
  h2: '3vw',
  h3: '2vw',
  h4: '2vw',
  h5: '1vw',
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
  const typeCss = types[type || 'page-title'];
  return (
    <HeadingElement css={[heading, fontSize, typeCss]}>{children}</HeadingElement>
  );
};
