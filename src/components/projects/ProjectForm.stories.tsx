import React, { FC } from 'react';

import { action } from '@storybook/addon-actions';
import { ProjectForm } from './ProjectForm';

export default ({ title: 'Components | Projects/ProjectForm' });

export const Component: FC = () => (
  <ProjectForm
    onSubmit={action('onSubmit')}
  />
);
