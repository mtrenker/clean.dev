import React, { FC } from 'react';
import { text } from '@storybook/addon-knobs';

import { HeroImage } from './HeroImage';

export default { title: 'Components/HeroImage' };

// eslint-disable-next-line max-len
const image = '//images.ctfassets.net/utnykvjk2m6k/6so6AgwyVatfBYo1KPZaLZ/240128d21da0fd59a75e216d90b35c52/mitchell-luo-z1c9juteR5c-unsplash.jpg';

export const component: FC = () => {
  const url = text('Image URL', image);
  return (
    <HeroImage alt="test" url={url} />
  );
};
