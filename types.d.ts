import { FC } from 'react';

declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.jpg' {
  const value: any;
  export = value;
}

declare module 'responsive-loader/sharp' {
  const value: any;
  export = value;
}

/**
 * StorybookComponent for Storybook
 */
interface SC extends FC {
  story?: {
    storyName?: string;
    parameters?: any;
    decorators?: string[];
  }
}
