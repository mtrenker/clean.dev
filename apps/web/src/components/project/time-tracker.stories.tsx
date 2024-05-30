import type { Story } from '@ladle/react';
import type { TimeTrackerProps } from './time-tracker';
import { TimeTracker } from './time-tracker';

export const Default: Story<TimeTrackerProps> = ({endTime, onSubmit, startTime, notes}) => (
  <TimeTracker
    endTime={endTime}
    notes={notes}
    onSubmit={onSubmit}
    startTime={startTime}
  />
);

Default.args = {
  endTime: '2021-05-03T13:00:00.000Z',
  notes: 'Some notes',
  startTime: '2021-05-03T12:00:00.000Z',
};

Default.argTypes = {
  startTime: {
    control: {
      type: 'date',
    },
  },
  endTime: {
    control: {
      type: 'date',
    },
  },
  notes: {
    control: {
      type: 'text',
    },
  },
  onSubmit: {
    action: 'submit',
  },
};
