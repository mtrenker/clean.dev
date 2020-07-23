import React from 'react';
import { RenderNode } from '@contentful/rich-text-react-renderer';

import { ChangePassword } from '../components/blueprints/ChangePassword';
import { ProjectEditor } from '../components/blueprints/ProjectEditor';
import { TimeTracking } from '../components/blueprints/TimeTracking';
import { Blog } from '../components/blueprints/Blog';

export const mapWidgets = (): RenderNode => ({
  blog: () => <Blog />,
  'change-password': () => <ChangePassword />,
  'time-tracking': () => <TimeTracking />,
  'project-editor': () => <ProjectEditor />,
});
