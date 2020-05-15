import React, { FC } from 'react';
import { css } from '@emotion/core';

export const container = css`
  @media (min-width: 1200px) {
    width: 1170px;
  }
  margin: 0 auto;
`;

export const Container: FC = ({ children }) => (
  <div css={container}>
    {children}
  </div>
);
