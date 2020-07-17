import React, { FC } from 'react';

interface HeroImageProps {
  url: string;
  alt: string;
}

// mobile: '576px',
// tablet: '768px',
// desktop: '992px',
// large: '1200px',

export const HeroImage: FC<HeroImageProps> = ({ url, alt }) => {
  const webp = 'webp';
  return (
    <picture>
      <source srcSet={`${url}?w=360&fm=${webp}`} media="(max-width: 360px)" type="image/webp" />
      <source srcSet={`${url}?w=360&fm=jpeg`} media="(max-width: 360px)" type="image/jpeg" />
      <source srcSet={`${url}?w=576`} media="(max-width: 576px)" />
      <source srcSet={`${url}?w=768`} media="(max-width: 768px)" />
      <source srcSet={`${url}?w=992`} media="(max-width: 992px)" />
      <source srcSet={`${url}?w=1200`} media="(max-width: 1200px)" />
      <source srcSet={`${url}?w=1900`} media="(min-width: 1200px)" />
      <img src={url} alt={alt} />
    </picture>
  );
};
