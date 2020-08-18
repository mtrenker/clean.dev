import React from 'react';
import { Story, Meta } from '@storybook/react';
import { lorem } from 'faker';

import { Card, CardProps } from './Card';

export default {
  title: 'Components/Layout/Card',
  component: Card,
  argTypes: {
    outlined: {
      control: 'boolean',
    },
  },
} as Meta<CardProps>;

const Template: Story<CardProps> = ({ outlined }) => (
  <Card outlined={outlined}>
    <p>{lorem.paragraph()}</p>
  </Card>
);

export const Base = Template.bind({});

export const Outlined = Template.bind({});
Outlined.args = {
  outlined: true,
};
