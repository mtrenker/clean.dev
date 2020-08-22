import React, { FC, useState } from 'react';
import { css, keyframes } from '@emotion/core';
import { Link } from 'react-router-dom';

import { Icon } from '../typography/Icon';
import { useTheme } from '../../lib/style';
import { Theme } from '../../themes/default';

const slideIn = keyframes`
  from {
    top: -50px;
    z-index: -1;
  }
  99% {
    top: 0;
    z-index: -1;
  }
  to {
    z-index: 0;
  }
`;
const slideOut = keyframes`
  from {
    top: 0;
  }

  to {
    top: -50px;
    z-index: -1;
  }
`;

const headerCss = ({ breakPoints, css: { containerCss } }: Theme) => css`
  @media print {
    display: none;
  }
  @media (min-width: ${breakPoints.mobile}) {
    background-color: white ;
    box-shadow: 0 2px 5px rgba(0, 0, 0, .1);
  }

  .css-${containerCss.name} {
    display: flex;
    h1 {
      flex: 1;
      font-weight: bold;
      span {
        font-weight: lighter;
        font-family: consolas;
      }
    }
    nav {
      flex: 1;
      ul {
        display: none;
      }
      svg {
        cursor: pointer;
      }
      @media (min-width: ${breakPoints.mobile}) {
        svg {
          display: none;
        }
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
    }
  }
`;

const mobileNavCss = ({ breakPoints }: Theme) => css`
  display: none;
  @media (max-width: ${breakPoints.mobile}) {
    display: block;
    position: relative;
    &.hide {
      top: -50px;
      z-index: -1;
      animation: ${slideOut} .5s ease-in;
    }
    &.show {
      animation: ${slideIn} .5s ease-in;
    }
    ul {
      display: flex;
      justify-content: space-between;
      margin: 0;
      padding: 0 1rem;
      li {
        list-style: none;
        display: block;
        a {
          text-decoration: none;
          color: #000;
        }
      }
    }
  }
`;

export const Header: FC = () => {
  const theme = useTheme();
  const { css: { containerCss } } = theme;
  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);
  const onMenuClick = (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault();
    setShowMobileNav(!showMobileNav);
  };
  return (
    <header css={headerCss(theme)}>
      <div css={containerCss}>
        <h1>
          clean
          <span>dev</span>
        </h1>
        <nav>
          <Icon icon="bars" onClick={onMenuClick} />
          <ul>
            <li><Link to="/">Home</Link></li>
          </ul>
        </nav>
      </div>
      <div css={mobileNavCss} className={showMobileNav ? 'show' : 'hide'}>
        <ul>
          <li><Link to="/">Home</Link></li>
        </ul>
      </div>
    </header>
  );
};
