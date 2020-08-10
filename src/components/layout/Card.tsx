import React, { FC } from 'react';
import { css } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { Theme } from '../../themes/default';

const cardCss = ({ card }: Theme) => css`
  border: 1px solid black;
  border-radius: ${card.border.radius}px;
  overflow: hidden;
`;

export const Card: FC = ({ children }) => {
  const theme = useTheme<Theme>();
  return (
    <div css={cardCss(theme)}>
      {children}
    </div>
  );
};
