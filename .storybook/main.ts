module.exports = {
  stories: [
    '../src/**/*.stories.@(tsx|mdx)',
    '../docs/**/*.stories.@(tsx|mdx)'
  ],
  addons: [
    '@storybook/addon-actions/register',
    '@storybook/addon-knobs/register',
    '@storybook/addon-viewport/register',
    '@storybook/addon-a11y/register',
    '@storybook/addon-docs',
  ]
};
