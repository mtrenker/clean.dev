import React, { FC, Fragment } from 'react';

import { css, Theme, useTheme } from '../../lib/style';

export interface HeroImageProps {
  url?: string;
  alt?: string;
  className?: string;
}

const imageCss = css`
  background-color: #cccccc;
  object-fit: cover;
`;

const heroCss = ({ breakPoints }: Theme) => css`
  @media (max-width: ${breakPoints.mobile}) {
    height: 200px;
    overflow: hidden;
    .css-${imageCss.name} {
      margin-top: -125px;
    }
  }
`;

export const HeroImage: FC<HeroImageProps> = ({ url, alt }) => {
  const theme = useTheme();
  const { breakPoints } = theme;
  const sizes = Object.values(breakPoints).map((size) => size.substring(0, size.length - 2));
  return (
    <figure css={heroCss(theme)}>
      <picture>
        {/* mobile fallbacks for resolutions smaller than 360px */}
        <source srcSet={`${url}?w=360&fm=webp`} media="(max-width: 360px)" type="image/webp" />
        <source srcSet={`${url}?w=360&fm=jpg`} media="(max-width: 360px)" type="image/jpeg" />
        {/* our breakpoints */}
        {sizes.map((size) => (
          <Fragment key={size}>
            <source srcSet={`${url}?w=${size}&fm=webp`} media={`(max-width: ${size}px)`} type="image/webp" />
            <source srcSet={`${url}?w=${size}&fm=jpg`} media={`(max-width: ${size}px)`} type="image/jpeg" />
          </Fragment>
        ))}
        {/* fallback for everything larger than 1200 and ommit webp for larger images */}
        <source srcSet={`${url}?w=1900&fm=jpg`} media="(min-width: 1200px)" type="image/jpeg" />
        <img src={url} alt={alt} css={imageCss} height="400" width="100%" />
      </picture>
    </figure>
  );
};
