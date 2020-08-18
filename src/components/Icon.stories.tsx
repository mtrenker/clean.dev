import React from 'react';
import { Meta, Story } from '@storybook/react';

import { Icon, IconProps } from './Icon';

export default {
  title: 'Components/Icons',
  component: Icon,
  argTypes: {
    icon: {
      defaultValue: 'github',
    },
  },
} as Meta<IconProps>;

const Template: Story<IconProps> = ({ icon }) => (
  <Icon icon={icon} />
);

export const component = Template.bind({});
component.args = {
  icon: 'github',
};
