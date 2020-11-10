import { css } from '@emotion/core';

import { Theme } from '../lib/style';
import * as tokens from './tokens';

export const breakPoints = {
  mobile: '576px',
  tablet: '768px',
  desktop: '992px',
  large: '1200px',
} as const;

export const containerCss = css`
  width: 100%;
  @media (min-width: ${breakPoints.mobile}) {
    margin-left: auto;
    margin-right: auto;
    padding: 0;
    max-width: 546px;
  }
  @media (min-width: ${breakPoints.tablet}) {
    padding: 0 1rem;
    max-width: 738px;
  }
  @media (min-width: ${breakPoints.desktop}) {
    max-width: 962px;
  }
  @media (min-width: ${breakPoints.large}) {
    max-width: 1200px;
  }
`;

export const defaultTheme: Theme = {
  breakPoints,
  css: {
    containerCss,
  },
  card: {
    background: {
      color: tokens.XdColorCardBackground,
    },
    border: {
      color: '#000000',
      radius: 4,
    },
  },
};
