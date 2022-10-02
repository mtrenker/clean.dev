import { Story, Meta } from '@storybook/react';

import { Code, CodeProps } from './Code';
export default {
  title: 'Code',
  component: Code,
} as Meta<CodeProps>;

const Template: Story<CodeProps> = (props) => <Code {...props} />;

export const Default = Template.bind({});
