import type { StorybookConfig } from '@storybook/nextjs-vite';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const getAbsolutePath = (value: string): string =>
  dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));

const config: StorybookConfig = {
  stories: [
    '../src/app/**/*.stories.@(ts|tsx)',
    '../src/components/ui/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs-vite'),
    options: {},
  },
  staticDirs: ['../public'],
};

export default config;
