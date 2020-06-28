import React from 'react';
import { RenderNode } from '@contentful/rich-text-react-renderer';

import { ChangePassword } from '../components/blueprints/ChangePassword';
import { ProjectEditor } from '../components/blueprints/ProjectEditor';
import { TimeTracking } from '../components/blueprints/TimeTracking';

export const mapWidgets = (): RenderNode => ({
  'change-password': () => <ChangePassword />,
  'time-tracking': () => <TimeTracking />,
  'project-editor': () => <ProjectEditor />,
});
