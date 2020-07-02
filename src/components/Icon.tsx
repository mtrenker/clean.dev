import React, { FC } from 'react';
import { css } from '@emotion/core';
import Github from '@fortawesome/fontawesome-free/svgs/brands/github.svg';
import Clock from '@fortawesome/fontawesome-free/svgs/solid/clock.svg';
import Times from '@fortawesome/fontawesome-free/svgs/solid/times.svg';

export interface IconProps {
  icon: 'github' | 'clock' | 'times'
}

const iconCss = css`
  height: 24px;
  width: 24px;
`;

export const iconSet = new Map<string, React.SFC<React.SVGProps<SVGSVGElement>>>();
iconSet.set('github', Github);
iconSet.set('clock', Clock);
iconSet.set('times', Times);

export const Icon: FC<IconProps> = ({ icon }) => {
  const Svg = iconSet.get(icon) || Times;
  return (
    <Svg css={iconCss} />
  );
};
