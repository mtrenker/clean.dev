import React, { FC, useState } from 'react';
import { css, keyframes } from '@emotion/core';

import { Link } from 'react-router-dom';
import { Container, container } from './Container';
import { breakPoints } from '../themes/default';
import { Icon } from './Icon';

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

const headerCss = css`
  @media print {
    display: none;
  }
  @media (min-width: ${breakPoints.mobile}) {
    display: grid;
    position: relative;
    grid-template:
      "topbar topbar" auto
      / 1fr 1fr;
    background-color: #F5F5F5;
  }
`;

const topbarCss = css`
  background-color: white ;
  box-shadow: 0 2px 5px rgba(0, 0, 0, .1);
  grid-area: topbar;

  .css-${container.name} {
    display: flex;
    align-items: center;
  }
`;

const logoCss = css`
  flex: 1;
  font-weight: bold;
  span {
    font-weight: lighter;
    font-family: consolas;
  }
`;

const navCss = css`
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
`;

const mobileNavCss = css`
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
  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);
  const onMenuClick = (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault();
    setShowMobileNav(!showMobileNav);
  };
  return (
    <header css={headerCss}>
      <div css={topbarCss}>
        <Container>
          <h1 css={logoCss}>
            clean
            <span>dev</span>
          </h1>
          <nav css={navCss}>
            <Icon icon="bars" onClick={onMenuClick} />
            <ul>
              <li><Link to="/">Home</Link></li>
            </ul>
          </nav>
        </Container>
      </div>
      <div css={mobileNavCss} className={showMobileNav ? 'show' : 'hide'}>
        <ul>
          <li><Link to="/">Home</Link></li>
        </ul>
      </div>
    </header>
  );
};
