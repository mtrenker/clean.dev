import React, { FC } from "react";
import { css } from "@emotion/core";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";

const navBarCss = css`
  background-color: red;
`;

export const Header: FC = ({ children }) => (
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
    {children}
  </header>
);
