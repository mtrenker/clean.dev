import React, { FC } from 'react';
import { select } from '@storybook/addon-knobs';

import { Icon } from './Icon';

export default { title: 'Components/Icon', component: Icon };

export const Example: FC = () => {
  const icon = select('Icon', { github: 'github', times: 'times', clock: 'clock' }, 'github');
  return (
    <Icon icon={icon} />
  );
};
