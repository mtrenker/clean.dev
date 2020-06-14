import React, { FC } from 'react';
import { action } from '@storybook/addon-actions';

import { TimeTracker } from './TimeTracker';
import { Tracking } from '../../graphql/hooks';

export default { title: 'Components | Tracking' };

export const timeTracker: FC = () => (
  <>
    <TimeTracker onSubmit={action('onSubmit')} />
  </>
);

export const prefilledTimeTracker: FC = () => {
  const tracking: Tracking = {
    id: 'fake',
    startTime: new Date('2015-06-15T12:23:00.000Z').toISOString(),
    endTime: new Date('2015-06-15T20:00:00.000Z').toISOString(),
    description: 'Foo Bar',
  };
  return (
    <>
      <TimeTracker
        onSubmit={action('onSubmit')}
        tracking={tracking}
      />
    </>
  );
};
