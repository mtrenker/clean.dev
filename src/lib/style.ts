import { SerializedStyles } from '@emotion/core';
import { useTheme as emotionUseTheme } from 'emotion-theming';

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

export { css } from '@emotion/core';
export const useTheme = (): Theme => emotionUseTheme<Theme>();
