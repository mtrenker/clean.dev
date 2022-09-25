import { Story, Meta } from '@storybook/react';
import { LayoutDecorator } from '../../../.storybook/decorators';

import { TimeTracker, TimeTrackerProps } from './TimeTracker';

export default {
  title: 'TimeTracker',
  component: TimeTracker,
  decorators: [LayoutDecorator],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta<TimeTrackerProps>;

const Template: Story<TimeTrackerProps> = (props) => <TimeTracker {...props} />;

export const Default = Template.bind({});
