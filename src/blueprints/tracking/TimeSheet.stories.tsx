import React from 'react';

import { SC } from '../../../types';
import { TimeSheet } from './TimeSheet';

export default { title: 'Blueprints/Tracking/TimeSheet', component: TimeSheet };

export const Blueprint: SC = () => (
  <div>
    <TimeSheet />
  </div>
);

Blueprint.story = {};
