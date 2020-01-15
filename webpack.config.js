const path = require('path');
const merge = require('webpack-merge');
const { createCompatibilityConfig } = require('@open-wc/building-webpack');

const configs = createCompatibilityConfig({
  input: path.resolve(__dirname, './index.html'),
});

module.exports = configs.map(config =>
  merge(config, {
    module: {
      rules: [{
        test: /\.ts$/, loader: 'babel-loader'
      }, {
        test: /\.png$/, loader: 'file-loader'
      }],
    },
    resolve: {
      extensions: ['.ts', '.js', '.json']
    }
  }),
);
