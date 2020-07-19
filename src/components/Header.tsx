import React, { FC } from 'react';
import { css } from '@emotion/core';

import { Link } from 'react-router-dom';
import { Container, container } from './Container';
import { breakPoints } from '../themes/default';
import { Icon } from './Icon';

const onMenuClick = (e: React.MouseEvent<SVGElement>) => {
  console.log(e);
};

export const Header: FC = ({ children }) => {
  const headerCss = css`
    @media (min-width: ${breakPoints.mobile}) {
      display: grid;
      grid-template:
        "topbar topbar" auto
        "infobar infobar" max-content
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

  const infobarCss = css`
    grid-area: infobar;
    .css-${container.name} {
      height: 100%;
      display: flex;
      justify-content: space-between;
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
    @media (max-width: ${breakPoints.mobile}) {
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
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </nav>
        </Container>
      </div>
      { children && (
      <div css={infobarCss}>
        <Container>
          {children}
        </Container>
      </div>
      )}
    </header>
  );
};
