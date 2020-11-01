import React, { FC } from 'react';
import { css } from '@emotion/core';

import { NavLink } from 'react-router-dom';
import { useTheme } from '../../lib/style';
import { Login } from '../user/Login';
import { Theme } from '../../themes/default';

const headerCss = (theme: Theme) => css`
  @media print {
    display: none;
  }
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, .1);

  .css-${theme.css.containerCss.name} {
    display: grid;
    align-items: center;
    grid-template-columns: 1fr 2fr 1fr;
    h1 {
      font-weight: bold;
      span {
        font-weight: lighter;
        font-family: consolas;
      }
    }
    nav {
      ul {
        display: flex;
        margin: 0;
        padding: 0;
        li {
          flex: 1;
          list-style: none;
          a {
            display: block;
            color: #000;
          }
        }
      }
    }
  }
`;

export const Header: FC = () => {
  const theme = useTheme();
  const { css: { containerCss } } = theme;
  return (
    <header css={headerCss(theme)}>
      <div css={containerCss}>
        <h1>
          clean
          <span>dev</span>
        </h1>
        <nav>
          <ul>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/blog">Blog</NavLink>
            </li>
          </ul>
        </nav>
        <Login />
      </div>
    </header>
  );
};
