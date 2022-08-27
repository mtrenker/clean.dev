import { Story, Meta } from '@storybook/react';

import { ProjectList } from './ProjectList';
import { Layout } from '../../common/components/Layout';
import { projects } from '../../data/projects';

export default {
  title: 'Projects',
  component: ProjectList,
  parameters: {
    layout: 'fullscreen',
  },
  excludeStories: /.*Data$/,
} as Meta;

const Template: Story = () => (
  <Layout>
    <div className="container mx-auto  py-6">
      <ProjectList />
    </div>
  </Layout>
);



export const Default = Template.bind({});
Default.args = {
  projects,
};
