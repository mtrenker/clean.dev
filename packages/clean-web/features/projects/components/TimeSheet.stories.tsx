import { Story, Meta } from '@storybook/react';
import { LayoutDecorator } from '../../../.storybook/decorators';

import { TimeSheet, TimeSheetProps } from './TimeSheet';
export default {
  title: 'TimeSheet',
  component: TimeSheet,
  decorators: [LayoutDecorator],
} as Meta<TimeSheetProps>;

const Template: Story<TimeSheetProps> = (props) => <TimeSheet {...props} />;

export const Default = Template.bind({});
