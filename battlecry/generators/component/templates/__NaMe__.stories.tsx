import React from 'react';
import { Meta, Story } from '@storybook/react';

import { __NaMe__, __NaMe__Props } from './__NaMe__';

export default {
  title: '__type__/__NaMe__',
  component: __NaMe__,
} as Meta<__NaMe__Props>;

const Template: Story<__NaMe__Props> = () => <__NaMe__ />;

export const __name__ = Template.bind({});
