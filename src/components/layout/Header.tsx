import React, { FC } from 'react';
import { css } from '@emotion/core';

import { Container, container } from './Container';
import { breakPoints } from '../../themes/default';
import { Login } from '../auth/Login';

export const Header: FC = ({ children }) => {
  const header = css`
    @media (min-width: ${breakPoints.mobile}) {
      display: grid;
      grid-template:
        "topbar topbar" 50px
        "infobar infobar" max-content
        / 1fr 1fr;
      background-color: #F5F5F5;
      margin-bottom: 48px;
    }
  `;

  const topbar = css`
    background-color: white ;
    box-shadow: 0 2px 5px rgba(0, 0, 0, .1);
    grid-area: topbar;

    .css-${container.name} {
      display: flex;
      align-items: center;
    }
  `;

  const infobar = css`
    grid-area: infobar;
    .css-${container.name} {
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `;

  const logo = css`
    flex: 1;
    font-weight: bold;
    span {
      font-weight: lighter;
      font-family: consolas;
    }
  `;

  const nav = css`
    display: none;
    @media (min-width: ${breakPoints.mobile}) {
      display: block;
      flex: 1;
      ul {
        display: flex;
        justify-content: space-between;
        li {
          display: block;
          a {
            text-decoration: none;
            color: #000;
          }
        }
      }
    }
  `;

  return (
    <header css={header}>
      <div css={topbar}>
        <Container>
          <h1 css={logo}>
            clean
            <span>dev</span>
          </h1>
          <nav css={nav}>
            <ul>
              <li><a href="/">Home</a></li>
            </ul>
          </nav>
          <Login />
        </Container>
      </div>
      { children && (
      <div css={infobar}>
        <Container>
          {children}
        </Container>
      </div>
      )}
    </header>
  );
};
