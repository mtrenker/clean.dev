import path from 'path';
import webpack from 'webpack';
import devServer from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import DotEnv from 'dotenv-webpack';

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
  entry: './src/index.tsx',
  devtool: 'source-map',
  target: 'web',
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
        test: /\.png$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
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
    extensions: ['.mjs', '.js', '.json', '.ts', '.tsx', '.map'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle-[contenthash].js',
    publicPath: '/',
  },
  plugins: [
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
