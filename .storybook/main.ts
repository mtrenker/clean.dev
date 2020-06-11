import webpack from "webpack";
import merge from "webpack-merge";

import appConfig from "../webpack.config";

module.exports = {
  webpackFinal: (storybookConfig: webpack.Configuration): webpack.Configuration => {

    return merge(storybookConfig, {
      module: appConfig.module,
      resolve: appConfig.resolve
    });
  },
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-actions/register',
    '@storybook/addon-knobs/register',
    '@storybook/addon-viewport/register'
  ]
};
