import React, { FC } from 'react';
import { css } from '@emotion/core';

import { useTheme } from '../../lib/style';
import { Theme } from '../../themes/default';

const footerCss = ({ breakPoints }: Theme) => css`
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

export const Footer: FC = () => {
  const theme = useTheme();
  return (
    <footer css={footerCss(theme)}>
      <h4>cleandev</h4>
    </footer>
  );
};
