import React, { FC } from 'react';
import { css } from '@emotion/core';

import { Container, container } from './Container';
import { breakPoints } from '../../themes/default';

export const Footer: FC = () => {
  const footer = css`
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

      .css-${container.name} {
        display: flex;
        justify-content: space-between;
        div {
          flex: 1;
        }
      }
    }
  `;
  const contact = css`
    font-style: normal;
  `;
  return (
    <footer css={footer}>
      <Container>
        <div>
          <h4>cleandev</h4>
          <ul>
            <li>
              <a href="/">About</a>
            </li>
          </ul>
        </div>
        <div>
          <h4>social</h4>
          <ul>
            <li>
              <a href="/">LinkedIn</a>
            </li>
            <li>
              <a href="/">GitHub</a>
            </li>
            <li>
              <a href="/">StackOverflow</a>
            </li>
          </ul>
        </div>
        <div>
          <h4>get in touch</h4>
          <address css={contact}>
            Martin Trenker
            <br />
            martin@clean.dev
          </address>
        </div>
      </Container>
    </footer>
  );
};
