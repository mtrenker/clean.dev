import { Story, Meta } from '@storybook/react';
import { Layout } from '../../../common/components/Layout';

import { ProjectForm, ProjectFormProps } from './ProjectForm';
export default {
  title: 'ProjectForm',
  component: ProjectForm,
} as Meta<ProjectFormProps>;

const Template: Story<ProjectFormProps> = (props) => <ProjectForm {...props} />;

export const Default = Template.bind({});
Default.parameters = {
  layout: 'fullscreen',
};
Default.decorators = [
  (Story) => (
    <Layout>
      <div className="container mx-auto mt-10">
        <Story />
      </div>
    </Layout>
  ),
];

export const Prefilled = Template.bind({});
Prefilled.parameters = {
  layout: 'fullscreen',
};
Prefilled.decorators = [
  (Story) => (
    <Layout>
      <div className="container mx-auto mt-10">
        <Story />
      </div>
    </Layout>
  ),
];
Prefilled.args = {
  defaultValues: {
    client: 'Google',
    position: 'Software Engineer',
    summary: 'I worked on the Google search engine.',
    location: 'Mountain View, CA',
    startDate: '2019-01-01',
    endDate: '2020-01-01',
    highlights: [
      {
        description: 'I worked on the Google search engine.',
      },
    ],
    contact: {
      company: 'Google',
      firstName: 'John',
      lastName: 'Doe',
      email: '',
      street: '1600 Amphitheatre Parkway',
      city: 'Mountain View',
      zip: '94043',
      country: 'United States',
    },
  },
};


export const Loading = Template.bind({});
Loading.args = {
  loading: true,
};
Loading.parameters = {
  layout: 'fullscreen',
};
Loading.decorators = [
  (Story) => (
    <Layout>
      <div className="container mx-auto mt-10">
        <Story />
      </div>
    </Layout>
  ),
];
