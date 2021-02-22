import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import DotEnv from 'dotenv-webpack';

type Config = webpack.Configuration & {
  devServer: any;
};

const htmlConfig: HtmlWebpackPlugin.Options = {
  title: 'clean.dev',
  meta: {
    viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
  },
};

const config: Config = {
  mode: 'development',
  entry: './src/app.tsx',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'babel-loader',
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
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
    ],
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.json'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle-[hash].js',
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin(htmlConfig),
    new CleanWebpackPlugin(),
    new DotEnv({ systemvars: true }),
  ],
  devServer: {
    open: true,
    historyApiFallback: true,
  },
};

export default config;
