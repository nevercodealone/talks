const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const templates = fs
  .readdirSync(path.resolve(__dirname, "src/presentations"))
  .map((file) => {
    return new HtmlWebpackPlugin({
      template: path.resolve(__dirname, `src/presentations/${file}`),
      filename: file.replace(".ejs", ".html"),
    });
  });

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ejs$/,
        use: [
          {
            loader: "ejs-compiled-loader",
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
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
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};
