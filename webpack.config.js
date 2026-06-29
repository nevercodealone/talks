const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const talksData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "src/data/talks.json"), "utf-8")
);

const presentationTemplate = fs.readFileSync(
  path.resolve(__dirname, "src/templates/presentation.ejs"),
  "utf-8"
);

const startTemplate = fs.readFileSync(
  path.resolve(__dirname, "src/templates/start.ejs"),
  "utf-8"
);

const presentationsDir = path.resolve(__dirname, "src/presentations");

const dataDrivenTalks = talksData.filter(function(t) { return !t.custom; });
const customTalks = talksData.filter(function(t) { return t.custom; });

var plugins = [
  new CleanWebpackPlugin(),
];

dataDrivenTalks.forEach(function(talk) {
  var html = ejs.render(presentationTemplate, { talk: talk });
  plugins.push(new HtmlWebpackPlugin({
    templateContent: html,
    filename: talk.id + ".html",
    chunks: ['presentations', 'vendors'],
  }));
});

customTalks.forEach(function(talk) {
  var templatePath = path.resolve(presentationsDir, talk.id + ".ejs");
  if (fs.existsSync(templatePath)) {
    plugins.push(new HtmlWebpackPlugin({
      template: templatePath,
      filename: talk.id + ".html",
      chunks: ['presentations', 'vendors'],
    }));
  }
});

var standaloneEnglishTalks = ["vibe-coding-start-en"];
standaloneEnglishTalks.forEach(function(id) {
  var templatePath = path.resolve(presentationsDir, id + ".ejs");
  if (fs.existsSync(templatePath)) {
    plugins.push(new HtmlWebpackPlugin({
      template: templatePath,
      filename: id + ".html",
      chunks: ['presentations', 'vendors'],
    }));
  }
});

plugins.push(new HtmlWebpackPlugin({
  templateContent: ejs.render(startTemplate, { talks: talksData }),
  filename: "index.html",
  chunks: [],
  inject: false,
}));

plugins.push(new CopyWebpackPlugin({
  patterns: [
    { from: "src/content", to: "content" },
    { from: "src/CNAME", to: "." },
  ],
}));

module.exports = function(env, argv) {
  var isDev = argv.mode === 'development';

  return {
    mode: isDev ? "development" : "production",
    entry: {
      presentations: "./src/index.js",
    },
    output: {
      filename: isDev ? "[name].js" : "[name].[contenthash].js",
      path: path.resolve(__dirname, "docs"),
      clean: true,
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
    plugins: plugins,
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
      hints: false,
    },
  };
};
