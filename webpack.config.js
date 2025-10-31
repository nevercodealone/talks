const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const presentationsDir = path.resolve(__dirname, "src/presentations");
const templates = fs.existsSync(presentationsDir)
  ? fs.readdirSync(presentationsDir)
      .filter(file => file.endsWith('.ejs'))
      .map(file => new HtmlWebpackPlugin({
        template: path.resolve(presentationsDir, file),
        filename: file.replace(".ejs", ".html"),
        chunks: ['presentations', 'vendors'], // Use presentations bundle
      }))
  : [];

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    mode: isDev ? "development" : "production",
    entry: {
      startpage: "./src/startpage.js",
      presentations: "./src/index.js",
    },
    output: {
      filename: isDev ? "[name].js" : "[name].[contenthash].js",
      path: path.resolve(__dirname, "docs"),
      clean: true, // Clean the output directory before emit.
    },
    devtool: isDev ? 'eval-source-map' : false,
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
        chunks: ['startpage'], // Use lightweight startpage bundle only
      }),
      ...templates,
      new CopyWebpackPlugin({
        patterns: [
          { from: "src/content", to: "content" },
          { from: "src/CNAME", to: "CNAME" }
        ],
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
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
          },
          highlight: {
            test: /[\\/]node_modules[\\/]highlight\.js/,
            name: "highlight",
            priority: 20,
          },
        },
      },
    },
    performance: {
        hints: false, // Disable all performance warnings
    },  
  };
};

