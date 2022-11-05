import { Story, Meta } from '@storybook/react';
import { LayoutDecorator } from '../../../.storybook/decorators';

import { TrackingGraph, TrackingGraphProps } from './TrackingGraph';
export default {
  title: 'TrackingGraph',
  component: TrackingGraph,
  decorators: [LayoutDecorator],
} as Meta<TrackingGraphProps>;

const Template: Story<TrackingGraphProps> = (props) => <TrackingGraph {...props} />;

export const Default = Template.bind({});
