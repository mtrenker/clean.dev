import React, { FC } from 'react';
import { css } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { Theme } from '../../themes/default';

const cardCss = ({ card }: Theme) => css`
  border: 1px solid black;
  border-radius: ${card.border.radius}px;
  overflow: hidden;
`;

interface CardProps {
  className?: string
}

export const Card: FC<CardProps> = ({ children, className }) => {
  const theme = useTheme<Theme>();
  return (
    <div css={cardCss(theme)} className={className}>
      {children}
    </div>
  );
};
