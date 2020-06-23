import React from 'react';
import { RenderNode } from '@contentful/rich-text-react-renderer';

import { ChangePassword } from '../blueprints/auth/ChangePassword';
import { TimeTracking } from '../blueprints/tracking/TimeTracking';

export const mapWidgets = (): RenderNode => ({
  'change-password': () => <ChangePassword />,
  'time-tracking': () => <TimeTracking />,
});
