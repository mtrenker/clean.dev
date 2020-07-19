import React, { FC } from 'react';
import { css } from '@emotion/core';
import { breakPoints } from '../themes/default';

export const container = css`
  padding: 0 1rem;
  @media (min-width: ${breakPoints.mobile}) {
    margin: 0 auto;
    padding: 0;
    max-width: 546px;
  }
  @media (min-width: ${breakPoints.tablet}) {
    max-width: 738px;
  }
  @media (min-width: ${breakPoints.desktop}) {
    max-width: 962px;
  }
  @media (min-width: ${breakPoints.large}) {
    max-width: 1170px;
  }
`;

export const Container: FC = ({ children }) => (
  <div css={container}>
    {children}
  </div>
);
