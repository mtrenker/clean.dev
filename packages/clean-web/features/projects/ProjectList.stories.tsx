import { Story, Meta } from '@storybook/react';
import { faker } from "@faker-js/faker";

import { Projects, ProjectsProps } from './ProjectList';
import { Layout } from '../../common/components/Layout';

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

export const exampleProjectsData = (amount: number): ProjectsProps["projects"] =>
[...new Array(amount)].map(_ => ({
  title: faker.company.companyName(),
  summary: faker.lorem.paragraph(2),
  startDate: faker.date.past().toISOString(),
  endDate: faker.date.future().toISOString(),
  technologies: ['react', 'typescript', 'nextjs', 'tailwindcss'],
}));

export const Default = Template.bind({});
Default.args = {
  projects: exampleProjectsData(5),
};
