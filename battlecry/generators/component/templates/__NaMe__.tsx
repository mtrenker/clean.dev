import React, { FC } from 'react';

import { css, Theme, useTheme } from '../../lib/style';

interface __NaMe__Props {
  name: string;
}

const __name__Css = (theme: Theme) => css`

`;

export const __NaMe__: FC<__NaMe__Props> = ({ name }) => {
  const theme = useTheme();
  return (
    <div>
      {name}
    </div>
  );
};
