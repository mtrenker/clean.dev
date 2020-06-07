import React from 'react';
import { RenderNode } from '@contentful/rich-text-react-renderer';
import { ChangePassword } from '../components/widgets/auth/ChangePassword';

export const mapWidgets = (): RenderNode => ({
  'change-password': () => <ChangePassword />,
});
