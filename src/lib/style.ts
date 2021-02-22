import { SerializedStyles, useTheme as emotionUseTheme } from '@emotion/react';

export interface Theme {
  breakPoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    large: string;
  }
  css: {
    containerCss: SerializedStyles
  }
  card: {
    background: {
      color: string;
    },
    border: {
      radius: number;
      color: string;
    }
  }
}

export { css } from '@emotion/react';
export const useTheme = (): Theme => emotionUseTheme<Theme>();
