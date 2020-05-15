import React, { FC } from 'react';
import { css, SerializedStyles } from '@emotion/core';

import { Container, container } from './Container';

const header = (): SerializedStyles => css`
  background-color: #f6f6f6;
  display: grid;
  grid-template:
    "topbar topbar" 50px
    "infobar infobar" 200px
    / 1fr 1fr;
`;

const topbar = (): SerializedStyles => css`
  background-color: white ;
  box-shadow: 0 2px 5px rgba(0,0,0, .1);
  grid-area: topbar;

  .css-${container.name} {
    display: flex;
  }
`;

const infobar = css`
  grid-area: infobar;
  .css-${container.name} {
    display: flex;
    justify-content: space-between;
  }
`;

const logo = (): SerializedStyles => css`
  flex: 1;
`;

const nav = (): SerializedStyles => css`
  flex: 1;
  li {
    display: inline-block;
  }
`;

export const Header: FC = ({ children }) => (
  <header css={header}>
    <div css={topbar}>
      <Container>
        <h1 css={logo}>clean.dev</h1>
        <nav css={nav}>
          <ul>
            <li><a href="/">Start</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </nav>
      </Container>
    </div>
    <div css={infobar}>
      <Container>
        {children}
      </Container>
    </div>
  </header>
);
