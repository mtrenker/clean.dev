import { Story, Meta } from '@storybook/react';

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
