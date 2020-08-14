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

export const Component: Story<CardProps> = ({ outlined }) => (
  <Card outlined={outlined}>
    <p>{lorem.paragraph()}</p>
  </Card>
);

export const Outlined = Component.bind({});
Outlined.args = {
  outlined: true,
};
