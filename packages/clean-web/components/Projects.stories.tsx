import { Story, Meta } from '@storybook/react';
import { Layout } from './Layout';

import { Projects, ProjectsProps } from './Projects';

export default {
  title: 'Projects',
  component: Projects,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta<ProjectsProps>;

const Template: Story<ProjectsProps> = (props) => (
  <Layout>
    <div className='container mx-auto  py-6'>
      <Projects {...props} />
    </div>
  </Layout>
);

export const exampleProjects = [{
  title: 'Example Project',
  summary: 'Example Project Summary',
  startDate: '2020-01-01',
  endDate: '2020-01-31',
}];

export const Default = Template.bind({});
Default.args = {
  projects: exampleProjects,
};
