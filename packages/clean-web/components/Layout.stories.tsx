import { Story, Meta } from '@storybook/react';

import { Layout, LayoutProps } from './Layout';
export default {
  title: 'Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
  }
} as Meta<LayoutProps>;

const Template: Story<LayoutProps> = (props) => (
  <Layout {...props}>
    <div className='mx-auto max-w-screen-2xl p-4'>
      <p>Hello World</p>
    </div>
  </Layout>
);

export const Default = Template.bind({});
