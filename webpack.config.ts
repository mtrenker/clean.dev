import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

type Config = webpack.Configuration & {
  devServer: any;
};

const htmlConfig: HtmlWebpackPlugin.Options = {
  title: "clean.dev"
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
      }
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
