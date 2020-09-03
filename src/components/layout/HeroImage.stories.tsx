import React from 'react';
import { Meta, Story } from '@storybook/react';

import { HeroImage, HeroImageProps } from './HeroImage';
import { Header } from './Header';

export default {
  title: 'Components/HeroImage',
  component: HeroImage,
} as Meta<HeroImageProps>;

const Template: Story<HeroImageProps> = ({ url, alt }) => (
  <HeroImage url={url} alt={alt} />
);

export const Image = Template.bind({});
Image.args = {
  url: 'https://picsum.photos/2000/1500',
};

export const inPage: Story = () => (
  <>
    <Header />
    <Image url="https://picsum.photos/2000/1500" />
  </>
);

inPage.parameters = {
  layout: 'fullscreen',
};
