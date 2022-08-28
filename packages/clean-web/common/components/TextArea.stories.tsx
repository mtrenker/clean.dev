import { Story, Meta } from '@storybook/react';

import { TextArea, TextAreaProps } from './TextArea';
export default {
  title: 'TextArea',
  component: TextArea,
} as Meta<TextAreaProps>;

const Template: Story<TextAreaProps> = (props) => <TextArea {...props} />;

export const Default = Template.bind({});
