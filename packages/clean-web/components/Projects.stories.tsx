import { Story, Meta } from '@storybook/react';
import { faker } from "@faker-js/faker";

import { Layout } from './Layout';

import { Projects, ProjectsProps } from './Projects';

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

export const exampleProjectsData = (amount: number) =>
[...new Array(amount)].map(_ => ({
  title: faker.company.companyName(),
  summary: faker.lorem.paragraph(),
  startDate: faker.date.past().toISOString(),
  endDate: faker.date.future().toISOString(),
}));

export const Default = Template.bind({});
Default.args = {
  projects: exampleProjectsData(5),
};
