import React, { FC } from 'react';
import { css } from '@emotion/react';

import { NavLink } from 'react-router-dom';
import { Theme, useTheme } from '../../lib/style';
import MenuIcon from '../../assets/icons/menu-circle.svg';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: FC<HeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  return (
    <header css={headerCss(theme)}>
      <div className="container">
        <h1 className="brand">
          <NavLink to="/">
            clean
            <span>dev</span>
          </NavLink>
        </h1>
        <nav className="navigation">
          <MenuIcon width="28" height="28" className="mobile-menu" onClick={() => onMenuClick()} />
          <ul>
            <li>
              <NavLink exact to="/">
                Home
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

const headerCss = (theme: Theme) => css`
  @media print {
    display: none;
  }
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, .1);
  .container {
    display: grid;
    align-items: center;
    grid-template-columns: 1fr 1fr;
    ${theme.css.containerCss.styles};
    .brand {
      font-weight: bold;
      span {
        font-weight: lighter;
        font-family: consolas;
      }
      a {
        color: black;
      }
    }
    .navigation {
      display: flex;
      justify-content: right;
      padding: 0 14px;
      ul {
        display: none;
        @media(min-width: ${theme.breakPoints.mobile}) {
          display: flex;
        }
        width: 100%;
        li {
          flex: 1;
          list-style: none;
          a {
            color: black;
            font-size: 16px;
            text-transform: uppercase;
            font-weight: bold;
            &.active {
              color: #AAAAAA;
            }
          }
        }
      }
      .mobile-menu {
        @media(min-width: ${theme.breakPoints.mobile}) {
          display: none;
        }
        cursor: pointer;
      }
    }
  }
`;
