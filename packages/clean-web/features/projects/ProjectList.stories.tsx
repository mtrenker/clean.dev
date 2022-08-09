import { Story, Meta } from '@storybook/react';

import { Projects, ProjectsProps } from './ProjectList';
import { Layout } from '../../common/components/Layout';
import { projects } from '../../data/projects';

export default {
  title: 'Projects',
  component: Projects,
  parameters: {
    layout: 'fullscreen',
  },
  excludeStories: /.*Data$/,
} as Meta<ProjectsProps>;

const Template: Story<ProjectsProps> = (props) => (
  <Layout>
    <div className='container mx-auto  py-6'>
      <Projects {...props} />
    </div>
  </Layout>
);



export const Default = Template.bind({});
Default.args = {
  projects,
};
