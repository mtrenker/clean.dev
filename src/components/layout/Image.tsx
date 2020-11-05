import React, { FC } from 'react';

import { css, Theme, useTheme } from '../../lib/style';

export interface ImageProps {
  alt: string;
  src: string;
}

const imageCss = (theme: Theme) => css`
  color: #000000;
  width: 100%;
`;

export const Image: FC<ImageProps> = ({ alt, src }) => {
  const theme = useTheme();
  return (
    <img css={imageCss(theme)} src={src} alt={alt} />
  );
};
