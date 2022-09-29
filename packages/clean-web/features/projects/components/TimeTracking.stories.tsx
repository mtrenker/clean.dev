import { Story, Meta } from '@storybook/react';
import { LayoutDecorator } from '../../../.storybook/decorators';

import { TimeTracking, TimeTrackingProps } from './TimeTracking';
export default {
  title: 'TimeTracking',
  component: TimeTracking,
  decorators: [LayoutDecorator],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta<TimeTrackingProps>;

const Template: Story<TimeTrackingProps> = (props) => <TimeTracking {...props} />;

export const Default = Template.bind({});
