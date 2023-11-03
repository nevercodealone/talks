const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const templates = fs
  .readdirSync(path.resolve(__dirname, "src/presentations"))
  .filter(file => file.endsWith('.ejs'))
  .map(file => new HtmlWebpackPlugin({
    template: path.resolve(__dirname, `src/presentations/${file}`),
    filename: file.replace(".ejs", ".html"),
  }));

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    mode: isDev ? "development" : "production",
    entry: "./src/index.js",
    output: {
      filename: isDev ? "[name].js" : "[name].[contenthash].js",
      path: path.resolve(__dirname, "docs"),
      clean: true, // Clean the output directory before emit.
    },
    devtool: isDev ? 'eval-source-map' : 'source-map',
    module: {
      rules: [
        {
          test: /\.ejs$/,
          use: ["ejs-compiled-loader"],
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src/start.ejs"),
        filename: "index.html",
      }),
      ...templates,
      new CopyWebpackPlugin({
        patterns: [{ from: "src/content", to: "content" }],
      }),
    ],
    devServer: {
      static: {
        directory: path.resolve(__dirname, "src"),
      },
      hot: true,
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    performance: {
        hints: false,
        maxEntrypointSize: Infinity,
        maxAssetSize: Infinity,
    },  
  };
};

