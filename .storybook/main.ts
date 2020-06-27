import path from "path";
import webpack from "webpack";
import merge from "webpack-merge";

import appConfig from "../webpack.config";

module.exports = {
  webpackFinal: (storybookConfig: webpack.Configuration): webpack.Configuration => {

    return merge(storybookConfig, {
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            exclude: [path.resolve(__dirname, 'node_modules')],
            loader: 'babel-loader',
          }, {
            test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].[ext]',
                  outputPath: 'fonts/',
                },
              },
            ],
          }, {
            test: /\.(png|jpg)$/i,
            loader: 'responsive-loader',
            options: {
              // eslint-disable-next-line global-require
              adapter: require('responsive-loader/sharp'),
              sizes: [300, 600, 1200, 2000],
              placeholder: true,
              placeholderSize: 50,
            },
          },
        ]
      },
      resolve: appConfig.resolve
    });
  },
  stories: ['../src/**/*.stories.(tsx|mdx)'],
  addons: [
    '@storybook/addon-actions/register',
    '@storybook/addon-knobs/register',
    '@storybook/addon-viewport/register',
    '@storybook/addon-a11y/register',
    '@storybook/addon-docs',
    {
      name: '@storybook/addon-storysource',
      options: {
        parser: "typescript",

      }
    }
  ]
};
