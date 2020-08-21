import React, { FC } from 'react';
import { css } from '@emotion/core';

import { useTheme } from '../../lib/style';
import { Theme } from '../../themes/default';

export const Footer: FC = () => {
  const theme = useTheme();
  const footer = ({ breakPoints }: Theme) => css`
    @media print {
      display: none;
    }
    a {
      color: #000;
      text-decoration: none;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    @media (min-width: ${breakPoints.mobile}) {
      border-top: 1px solid rgba(0, 0, 0, .1);
      height: 180px;
      padding: 20px;
      margin-top: 48px;
    }
  `;
  return (
    <footer css={footer(theme)}>
      <h4>cleandev</h4>
    </footer>
  );
};
