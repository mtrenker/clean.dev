import { Story, Meta } from '@storybook/react';

import { TextField, TextFieldProps } from './TextField';
export default {
  title: 'TextField',
  component: TextField,
} as Meta<TextFieldProps>;

const Template: Story<TextFieldProps> = (props) => <TextField {...props} />;

export const Default = Template.bind({});
