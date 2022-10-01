import { Story, Meta } from '@storybook/react';
import { LayoutDecorator } from '../../../.storybook/decorators';

import { TrackingTable, TrackingTableProps } from './TrackingTable';
export default {
  title: 'TimeSheet',
  component: TrackingTable,
  decorators: [LayoutDecorator],
} as Meta<TrackingTableProps>;

const Template: Story<TrackingTableProps> = (props) => <TrackingTable {...props} />;

export const Default = Template.bind({});
