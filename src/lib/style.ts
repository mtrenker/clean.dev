import { useTheme as emotionUseTheme } from 'emotion-theming';
import { css } from '@emotion/core';
import { Theme } from '../themes/default';

const useTheme = (): Theme => emotionUseTheme<Theme>();

export { Theme } from '../themes/default';

export default {
  useTheme,
  css,
};
