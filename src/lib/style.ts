import { useTheme as emotionUseTheme } from 'emotion-theming';
import { Theme } from '../themes/default';

export { css } from '@emotion/core';
export const useTheme = (): Theme => emotionUseTheme<Theme>();

export { Theme } from '../themes/default';
