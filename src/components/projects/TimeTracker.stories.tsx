import React from 'react';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { TimeTracker, TimeTrackerProps } from './TimeTracker';

export default {
  title: 'Components/Projects',
  args: {
    onCancelEdit: action('onCanelEdit'),
    onChangeProject: action('onChangeProject'),
    onSubmit: action('onSubmit'),
    projects: [
      { client: 'Test Client 1', id: '1234' },
      { client: 'Test Client 2', id: '5678' },
    ],
  },
} as Meta<TimeTrackerProps>;

const Template: Story<TimeTrackerProps> = ({
  onChangeProject, onSubmit, projects, tracking,
}) => (
  <TimeTracker
    onChangeProject={onChangeProject}
    onSubmit={onSubmit}
    projects={projects}
    tracking={tracking}
  />
);

export const Tracker = Template.bind({});

export const WithTracking = Template.bind({});

WithTracking.args = {
  ...Tracker.args,
  tracking: {
    id: 'sdfa923',
    projectId: '5678',
    startTime: '2020-10-17T08:00:00Z',
    endTime: '2020-10-17T16:00:00Z',
    description: 'Wrote some tests, Planning, Retro',
  },
};
