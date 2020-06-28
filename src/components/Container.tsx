import React, { FC } from 'react';
import { css } from '@emotion/core';

export const container = css`
  @media (min-width: 576px) {
    margin: 0 auto;
    width: 546px;
  }
  @media (min-width: 768px) {
    width: 738px;
  }
  @media (min-width: 992px) {
    width: 962px;
  }
  @media (min-width: 1200px) {
    width: 1170px;
  }
`;

export const Container: FC = ({ children }) => (
  <div css={container}>
    {children}
  </div>
);
