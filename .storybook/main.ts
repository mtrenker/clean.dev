import webpackConfig from "../webpack.config"

module.exports = {
  stories: [
    '../src',
    '../docs',
    '../experiments',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y/register',
  ],
  features: {
    previewCsfV3: true,
  },
  webpackFinal: (config: any) => {
    const devConfig = webpackConfig({development: true});
    return {
      ...config,
      // module: {
      //   ...config.module,
      //   rules: {
      //     ...config.module?.rules,
      //     ...devConfig.module?.rules
      //   }
      // }
    };
  },
};
