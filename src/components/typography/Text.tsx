import React, { FC } from 'react';
import { css } from '@emotion/react';

const text = css`
  color: #000;
  font-size: calc(1rem + .5vw);
`;

export const Text: FC = ({ children }) => (
  <p css={text}>{children}</p>
);
