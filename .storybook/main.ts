import path from "path";

const fortAwesomeDir = path.join(__dirname,'..', 'node_modules', '@fortawesome')

module.exports = {
  stories: [
    '../src/**/*.stories.@(tsx|mdx)',
    '../docs/**/*.stories.@(tsx|mdx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y/register',
  ],
  webpackFinal: async (config: any) => {

    const svgRule = config.module.rules.find((rule: any) => 'test.svg'.match(rule.test));
    svgRule.exclude = [fortAwesomeDir];

    config.module.rules.push({
      test: /\.svg$/i,
      include: [fortAwesomeDir],
      use: ["@svgr/webpack"]
    });

    return config;
  }
};
