import path from 'path';
import webpack from 'webpack';
import devServer from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import DotEnv from 'dotenv-webpack';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import remarkFrontmatter from 'remark-frontmatter';

interface WebpackEnv {
  production?: true;
  development?: true;
}

const htmlConfig: HtmlWebpackPlugin.Options = {
  title: 'clean.dev',
  meta: {
    viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
  },
};

const config = (env: WebpackEnv): webpack.Configuration & { devServer: devServer.Configuration } => ({
  mode: env.production ? 'production' : 'development',
  entry: './src/main.tsx',
  devtool: 'source-map',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'babel-loader',
      }, {
        test: /\.mdx?$/,
        loader: '@mdx-js/loader',
      }, {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }, {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
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
        test: /\.(png|jpg)$/,
        type: 'asset',
      }, {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
    ],
  },
  resolve: {
    extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.map'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle-[contenthash].js',
    publicPath: '/',
  },
  plugins: [
    new NodePolyfillPlugin(),
    new HtmlWebpackPlugin(htmlConfig),
    new DotEnv({ systemvars: true }),
  ],
  devServer: {
    open: true,
    historyApiFallback: true,
    hot: true,
  },
});

export default config;
