import React, { FC } from 'react';
import { css } from '@emotion/react';
import { NavLink } from 'react-router-dom';

import { Theme, useTheme } from '../../lib/style';

export const Footer: FC = () => {
  const theme = useTheme();
  return (
    <footer css={footerCss(theme)}>
      <div className="container">
        <section>
          <h4>clean.dev</h4>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
          </ul>
        </section>
        <section>
          <h4>Latest Posts</h4>
        </section>
        <section>
          <h4>Contact</h4>
        </section>
      </div>
    </footer>
  );
};

const footerCss = (theme: Theme) => css`
  @media print {
    display: none;
  }
  background: #000;
  .container {
    ${theme.css.containerCss};
    color: #FFF;
    fill: #FFF;
    display: grid;
    grid-template:
      "content content content" auto
      / 1fr 1fr 1fr
    ;
    a {
      color: #fff;
      text-decoration: none;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    section:last-child {
      text-align: right;
    }
  }
  @media (min-width: ${theme.breakPoints.mobile}) {
    border-top: 1px solid rgba(0, 0, 0, .1);
    height: 200px;
    padding: 20px;
    margin-top: 48px;
  }
`;
