import React from 'react';
import { Meta, Story } from '@storybook/react';
import { lorem, image } from 'faker';

import { Grid } from './Grid';
import { Card, BlogCardProps } from './Card';

export default {
  title: 'Components/Blog',
  component: Card,
  args: {
    imageUrl: 'https://source.unsplash.com/random/800x600',
    title: 'FooBar',
  },
} as Meta<BlogCardProps>;

const Template: Story<BlogCardProps> = ({ title, imageUrl }) => (
  <Card title={title} imageUrl={imageUrl}>
    {lorem.paragraph()}
  </Card>
);

export const teaserCard = Template.bind({});
teaserCard.parameters = {
  layout: 'centered',
};

export const blogGrid: Story = () => (
  <div style={{ width: 1280, margin: 'auto' }}>
    <Grid>
      <Card title={lorem.sentence()} imageUrl={image.business(800, 601)}>
        <p>{lorem.paragraph()}</p>
      </Card>
      <Card title={lorem.sentence()} imageUrl={image.business(800, 602)}>
        <p>{lorem.paragraph()}</p>
      </Card>
      <Card title={lorem.sentence()} imageUrl={image.business(800, 603)}>
        <p>{lorem.paragraph()}</p>
      </Card>
      <Card title={lorem.sentence()} imageUrl={image.business(800, 604)}>
        <p>{lorem.paragraph()}</p>
      </Card>
      <Card title={lorem.sentence()} imageUrl={image.business(800, 605)}>
        <p>{lorem.paragraph()}</p>
      </Card>
    </Grid>
  </div>
);
