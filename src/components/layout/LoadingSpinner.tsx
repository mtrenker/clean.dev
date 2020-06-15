import React, { FC } from 'react';
import { css } from '@emotion/core';

const spinnerCss = css`
  position: absolute;
  background: rgba(0, 0, 0, .3);
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  >div {
    display: inline-block;
    position: absolute;
    width: 80px;
    height: 80px;
  }
  >div>div {
    position: absolute;
    top: 33px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #000;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  >div>div:nth-of-type(1) {
    left: 8px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  >div>div:nth-of-type(2) {
    left: 8px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  >div>div:nth-of-type(3) {
    left: 32px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  >div>div:nth-of-type(4) {
    left: 56px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(24px, 0);
    }
  }
`;

const span = css`
  >div {
    position: absolute;
    width: 100%;
    height: 100%;
    top: calc(50% - 40px);
    bottom: 0;
    left: calc(50% - 40px);
    right: 0;
  }
`;

export const LoadingSpinner: FC = () => (
  <div css={[spinnerCss, span]}>
    <div>
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
);
