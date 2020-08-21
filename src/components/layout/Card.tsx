import React, { FC } from 'react';
import { css } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { Theme } from '../../themes/default';

export interface CardProps {
  className?: string;
  outlined?: boolean;
}

const cardCss = ({ outlined }: Partial<CardProps>, { card }: Theme) => css`
  box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
  border-radius: ${card.border.radius}px;
  overflow: hidden;
  ${outlined && css`
    border: 1px solid rgba(0, 0, 0, 0.12);
    box-shadow: none;
  `};
`;

export const Card: FC<CardProps> = ({ children, className, outlined }) => {
  const theme = useTheme<Theme>();
  return (
    <article css={cardCss({ outlined }, theme)} className={className}>
      {children}
    </article>
  );
};
