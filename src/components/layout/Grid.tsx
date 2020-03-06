import React, { FC } from "react";
import { css } from "@emotion/core";

const breakpoints = [576, 768, 992, 1200];

export const Grid: FC = ({ children }) => {
  const gridCss = css`
    display: grid;
    max-width: 1440px;
    grid-template:
      "header" auto
      "main" auto
      "footer" 100px
    ;
  `;
  return (
    <div css={gridCss}>
      {children}
    </div>
  )
};
