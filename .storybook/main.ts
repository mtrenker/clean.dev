import path from "path";


module.exports = {
  stories: [
    '../src/**/*.stories.@(tsx|mdx)',
    '../docs/**/*.stories.@(tsx|mdx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y/register',
  ],
};
