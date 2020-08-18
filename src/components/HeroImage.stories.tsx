import React from 'react';
import { Meta, Story } from '@storybook/react';

import { HeroImage, HeroImageProps } from './HeroImage';

export default {
  title: 'Components/HeroImage',
  component: HeroImage,
} as Meta<HeroImageProps>;

const Template: Story<HeroImageProps> = ({ url, alt }) => (
  <HeroImage url={url} alt={alt} />
);

export const heroImage = Template.bind({});
heroImage.args = {
  url: 'https://picsum.photos/2000/1500',
};
