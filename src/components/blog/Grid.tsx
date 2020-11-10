import React, { FC } from 'react';

import { css } from '../../lib/style';

const gridCss = css`
  display: flex;
  flex-wrap: wrap;

  gap: 16px;

  article {
    flex: 1 1 calc(50% - 16px);
  }
`;

export const Grid: FC = ({ children }) => (
  <div css={gridCss}>
    {children}
  </div>
);
