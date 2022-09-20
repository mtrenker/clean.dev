import { Story, Meta } from '@storybook/react';
import { Icon3dRotate } from '@tabler/icons';

import { Button, ButtonProps } from './Button';

export default {
  title: 'Button',
  component: Button,
} as Meta<ButtonProps>;

const Template: Story<ButtonProps> = (props) => <Button {...props} />;

export const Default = Template.bind({});
Default.args = {
  children: 'Button',
};

export const IconButton = Template.bind({});
IconButton.args = {
  children: <Icon3dRotate />,
};
