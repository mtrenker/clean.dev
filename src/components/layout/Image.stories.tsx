import React from 'react';
import { Meta, Story } from '@storybook/react';

import { Image, ImageProps } from './Image';

export default {
  title: 'Layout/Image',
  component: Image,
  args: {
    alt: 'Lorem Ipsum',
    src: 'https://source.unsplash.com/random',
  },
} as Meta<ImageProps>;

const Template: Story<ImageProps> = ({ alt, src }) => <Image alt={alt} src={src} />;

export const image = Template.bind({});
image.parameters = {
  layout: 'centered',
};
