/* eslint-disable import/namespace -- in a hurry deploy */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- in a hurry deploy */
import React from 'react';
import * as icons from '@tabler/icons-react'

export interface IconProps {
  name: string;
}

export const Icon: React.FC<IconProps> = ({name}) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- in a hurry deploy
  // @ts-expect-error
  const IconComponent = icons[`Icon${name}`];
  if (!IconComponent) {
    return null;
  }
  return <IconComponent />;
};
