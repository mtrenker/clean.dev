import React from 'react';
import { Meta, Story } from '@storybook/react';

import { TeaserCard, TeaserCardProps } from './TeaserCard';

export default {
  title: 'Blog/TeaserCard',
  component: TeaserCard,
  args: {
    image: 'https://source.unsplash.com/random',
  },
} as Meta<TeaserCardProps>;

const Template: Story<TeaserCardProps> = ({ title, image }) => (
  <TeaserCard
    title={title}
    image={image}
  />
);

export const teasercard = Template.bind({});
