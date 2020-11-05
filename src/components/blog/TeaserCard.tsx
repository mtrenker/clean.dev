import React, { FC } from 'react';

import { css, Theme, useTheme } from '../../lib/style';
import { Card } from '../layout/Card';

export interface TeaserCardProps {
  title: string;
  image: string;
}

const teasercardCss = (theme: Theme) => css`
  color: #000000;
`;

export const TeaserCard: FC<TeaserCardProps> = ({ title, image }) => {
  const theme = useTheme();
  return (
    <Card css={teasercardCss(theme)}>
      <img src={image} />
      {title}
    </Card>
  );
};
