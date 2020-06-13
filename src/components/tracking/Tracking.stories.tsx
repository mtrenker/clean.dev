import React, { FC } from 'react';
import { action } from '@storybook/addon-actions';

import { TimeTracker } from './TimeTracker';

export default { title: 'Components | Tracking' };

export const timeTracker: FC = () => (
  <>
    <TimeTracker onSubmit={action('onSubmit')} />
  </>
);
