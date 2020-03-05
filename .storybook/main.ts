import webpack from "webpack";

import appConfig from "../webpack.config";

module.exports = {
  webpackFinal: (storybookConfig: webpack.Configuration): webpack.Configuration => {
    storybookConfig.module!.rules.push(...appConfig.module!.rules);
    storybookConfig.resolve!.extensions!.push(".tsx", ".ts")
    return storybookConfig;
  },
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-knobs/register']
};
