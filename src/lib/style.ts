import { useTheme as emotionUseTheme } from 'emotion-theming';

import { Theme } from '../themes/default';

export const useTheme = (): Theme => emotionUseTheme<Theme>();

export { css } from '@emotion/core';
