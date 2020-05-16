import React, { FC } from 'react';
import { css } from '@emotion/core';
import { Container } from './Container';

export const Footer: FC = ({ children }) => {
  const footer = css`
    border-top: 1px solid rgba(0, 0, 0, .1);
    height: 180px;
    padding: 20px;
  `;
  return (
    <footer css={footer}>
      <Container>
        {children}
      </Container>
    </footer>
  );
};
