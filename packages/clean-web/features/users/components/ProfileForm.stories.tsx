import { Story, Meta } from '@storybook/react';
import { LayoutDecorator } from '../../../.storybook/decorators';

import { ProfileForm, ProfileFormProps } from './ProfileForm';
export default {
  title: 'ProfileForm',
  component: ProfileForm,
  decorators: [LayoutDecorator],
} as Meta<ProfileFormProps>;

const Template: Story<ProfileFormProps> = (props) => <ProfileForm {...props} />;

export const Default = Template.bind({});
