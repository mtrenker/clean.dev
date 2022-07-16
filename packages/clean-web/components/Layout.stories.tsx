import { Story, Meta } from '@storybook/react';

import { Layout, LayoutProps } from './Layout';
export default {
  title: 'Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
  }
} as Meta<LayoutProps>;

const Template: Story<LayoutProps> = (props) => <Layout {...props}><p>Hello World</p></Layout>;

export const Default = Template.bind({});
