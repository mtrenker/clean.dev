import { VFC } from 'react';

import { css, keyframes } from '@emotion/react';
import Brain from '../../assets/icons/brain.svg';
import Dashboard from '../../assets/icons/dashboard.svg';
import Cog from '../../assets/icons/cog.svg';

const brainAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(-1deg);
  }
  20% {
    transform: rotate(1deg);
  }
  30% {
    transform: rotate(-1deg);
  }
  40% {
    transform: rotate(1deg);
  }
  50% {
    transform: rotate(-1deg);
  }
  60% {
    transform: rotate(1deg);
  }
  70% {
    transform: rotate(-1deg);
  }
  80% {
    transform: rotate(1deg);
  }
  90% {
    transform: rotate(-1deg);
  }
  100% {
    fill: red:
    transform: rotate(0deg);
  }
`;

const cogAnimation = keyframes`
  0% {
    transform: rotate(0turn);
  }
  100% {
    transform: rotate(1turn);
  }
`;

const processCss = css`
  fill: #A9BF5A;
  margin: 0;
  position: relative;
  .brain, .cog-1, .cog-2, .cog-3, .dashboard {
    position: absolute;
  }
  .brain {
    width: 125px;
    left: 0px;
    top: 24px;
    transform-origin: center center;
    animation: ${brainAnimation} 1s linear infinite;
  }
  .cog-1 {
    width: 100px;
    left: 150px;
    top: 24px;
    animation: ${cogAnimation} 5s linear infinite;
  }
  .cog-2 {
    width: 125px;
    left: 195px;
    top: 100px;
    animation: ${cogAnimation} 5s linear reverse infinite;
  }
  .cog-3 {
    width: 150px;
    left: 70px;
    top: 150px;
    animation: ${cogAnimation} 5s linear infinite;
  }
  .dashboard {
    width: 150px;
    top: 235px;
    left: 24px;
    [data-name=background] {
      fill: var(--surface1);
    }
  }
`;

export const Process: VFC = () => (
  <figure css={processCss}>
    <Brain className="brain" />
    <Cog className="cog-1" />
    <Cog className="cog-2" />
    <Cog className="cog-3" />
    <Dashboard className="dashboard" />
  </figure>
);
