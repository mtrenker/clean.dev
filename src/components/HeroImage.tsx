import React, { FC } from 'react';

interface HeroImageProps {
  url: string;
  alt: string;
}

export const HeroImage: FC<HeroImageProps> = ({ url, alt }) => <img src={url} alt={alt} />;
