import { Story, Meta } from '@storybook/react';
import { LayoutDecorator } from '../../../.storybook/decorators';

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
Default.decorators = [LayoutDecorator];

export const Prefilled = Template.bind({});
Prefilled.parameters = {
  layout: 'fullscreen',
};
Prefilled.decorators = [LayoutDecorator];
Prefilled.args = {
  project: {
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
    categories: [],
    featured: false,
    id: '123',
    trackings: [],
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
Loading.decorators = [LayoutDecorator];
