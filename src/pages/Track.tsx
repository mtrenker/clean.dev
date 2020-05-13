import React, { FC } from 'react';

import { Login } from '../components/auth/Login';
import { TimeTracker } from '../components/widgets/TimeTracker/TimeTracker';

export const Track: FC = () => (
  <div>
    <h1>Tracking</h1>
    <Login />
    <TimeTracker />
  </div>
);
