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
