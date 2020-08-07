import React, { FC } from 'react';
import { css } from '@emotion/core';

import { Container, container } from './Container';
import { breakPoints } from '../themes/default';

export const Footer: FC = () => {
  const footer = css`
    @media print {
      display: none;
    }
    a {
      color: #000;
      text-decoration: none;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    @media (min-width: ${breakPoints.mobile}) {
      border-top: 1px solid rgba(0, 0, 0, .1);
      height: 180px;
      padding: 20px;
      margin-top: 48px;

      .css-${container.name} {
        display: flex;
        justify-content: space-between;
        div {
          flex: 1;
        }
      }
    }
  `;
  return (
    <footer css={footer}>
      <Container>
        <div>
          <h4>cleandev</h4>
        </div>
      </Container>
    </footer>
  );
};
