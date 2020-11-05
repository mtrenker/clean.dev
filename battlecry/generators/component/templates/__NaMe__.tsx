import React, { FC } from 'react';

import { css, Theme, useTheme } from '../../lib/style';

export interface __NaMe__Props {
  name?: string;
}

const __name__Css = (theme: Theme) => css`
  color: #000000;
`;

export const __NaMe__: FC<__NaMe__Props> = ({ name }) => {
  const theme = useTheme();
  return (
    <div css={__name__Css(theme)}>
      {name}
    </div>
  );
};
