import React, { FC } from 'react';
import { css, SerializedStyles } from '@emotion/core';
import { Link } from 'react-router-dom';

import { Theme } from '../../themes/default';

const navBarCss = (theme: Theme): SerializedStyles => css`
  background-color: ${theme.colors.primary} ;
`;

export const Header: FC = () => (
  <header>
    <h1>clean.dev</h1>
    <nav css={navBarCss}>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/cv">CV</Link></li>
        <li><Link to="/blog">Blog</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/huh">404</Link></li>
      </ul>
    </nav>
  </header>
);
