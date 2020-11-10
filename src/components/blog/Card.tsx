import React, { FC } from 'react';

import { css, Theme, useTheme } from '../../lib/style';
import { Image } from '../layout/Image';

export interface BlogCardProps {
  title: string;
  imageUrl: string;
}

/* eslint-disable no-unused-vars */
const teasercardCss = (theme: Theme) => css`
  display: grid;
  grid-template-rows: 350px auto 1fr auto;
  align-items: flex-start;

  background: #ffffff;

  img {
    object-fit: cover;
    max-height: 100%;
  }

  h3, p, footer {
    margin-top: 0;
  }

  footer {
    align-self: flex-end;
  }
`;

export const Card: FC<BlogCardProps> = ({ title, imageUrl, children }) => {
  const theme = useTheme();
  return (
    <article css={teasercardCss(theme)}>
      <Image src={imageUrl} alt={title} />
      <h3>{title}</h3>
      {children}
      <footer>
        <time>07.11.2020</time>

      </footer>
    </article>
  );
};
