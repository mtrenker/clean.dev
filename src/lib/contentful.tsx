import React from 'react';
import { RenderNode } from '@contentful/rich-text-react-renderer';

import { ChangePassword } from '../components/widgets/auth/ChangePassword';
import { TimeTracking } from '../components/widgets/tracking/TimeTracking';

export const mapWidgets = (): RenderNode => ({
  'change-password': () => <ChangePassword />,
  'time-tracking': () => <TimeTracking />,
});
