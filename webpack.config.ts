import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

type Config = webpack.Configuration & {
  devServer: any;
};

const htmlConfig: HtmlWebpackPlugin.Options = {
  title: "clean.dev",
  meta: {
    viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'
  }
};

const config: Config = {
  mode: "development",
  entry: "./src/app.tsx",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [path.resolve(__dirname, "node_modules")],
        loader: "babel-loader"
      }, {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }, {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }, {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        options: {
          name(resourcePath: string, resourceQuery: string) {
            if (process.env.NODE_ENV === 'development') {
              return '[path][name].[ext]';
            }
            return '[contenthash].[ext]';
          },
        },
      },
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle-[hash].js"
  },
  plugins: [new HtmlWebpackPlugin(htmlConfig), new CleanWebpackPlugin()],
  devServer: {
    open: true,
    historyApiFallback: true
  }
};

export default config;
