import React, { FC } from "react";
import { css } from "@emotion/core";

const navBarCss = css`
  background-color: red;
`;

export const Header: FC = ({ children }) => (
  <header>
    <nav css={navBarCss}>Test</nav>
    {children}
  </header>
);
