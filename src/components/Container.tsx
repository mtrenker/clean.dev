import React, { FC } from 'react';
import { css } from '@emotion/core';
import { breakPoints } from '../themes/default';

export const container = css`
  padding: 0 1rem;
  @media (min-width: ${breakPoints.mobile}) {
    margin: 0 auto;
    padding: 0;
    width: 546px;
  }
  @media (min-width: ${breakPoints.tablet}) {
    width: 738px;
  }
  @media (min-width: ${breakPoints.desktop}) {
    width: 962px;
  }
  @media (min-width: ${breakPoints.large}) {
    width: 1170px;
  }
`;

export const Container: FC = ({ children }) => (
  <div css={container}>
    {children}
  </div>
);
