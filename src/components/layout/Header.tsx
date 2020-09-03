import React, { FC } from 'react';
import { css } from '@emotion/core';

import { useTheme } from '../../lib/style';
import { Theme } from '../../themes/default';

const headerCss = ({ breakPoints }: Theme) => css`
  @media print {
    display: none;
  }
  z-index: 2;
  position: relative;
  color: white;
  @media (min-width: ${breakPoints.mobile}) {
    background-color: white ;
    color: black;
    box-shadow: 0 2px 5px rgba(0, 0, 0, .1);
  }

  h1 {
    font-weight: bold;
    span {
      font-weight: lighter;
      font-family: consolas;
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
      </div>
    </header>
  );
};
