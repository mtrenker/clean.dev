import React from 'react';
import { Meta, Story } from '@storybook/react';

import { Gist, GistProps } from './Gist';

export default {
  title: 'Components/Layout/Gist',
  component: Gist,
} as Meta<GistProps>;

const Template: Story<GistProps> = ({ gistId, title }) => <Gist gistId={gistId} title={title} />;

export const gist = Template.bind({});

gist.args = {
  gistId: '41a7d2231e456072a38a6747cd6fa925',
  title: 'Demo Gist',
};
