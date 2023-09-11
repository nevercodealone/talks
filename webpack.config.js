const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const fs = require("fs");

const headerTemplate = fs.readFileSync(
  path.resolve(__dirname, "./src/includes/header.ejs"),
  "utf8"
);
const footerTemplate = fs.readFileSync(
  path.resolve(__dirname, "./src/includes/footer.ejs"),
  "utf8"
);

const generateHtmlPlugins = (templateDir) => {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles
    .filter((item) => item.endsWith(".html") || item.endsWith(".ejs"))
    .map((item) => {
      const parts = item.split(".");
      const name = parts[0];
      const extension = parts[1];
      return new HtmlWebpackPlugin({
        filename: `${name}.html`,
        template: path.resolve(
          __dirname,
          `${templateDir}/${name}.${extension}`
        ),
        templateParameters: {
          header: headerTemplate,
          footer: footerTemplate,
        },
      });
    });
};

const htmlPlugins = generateHtmlPlugins("./src/presentations");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ejs$/,
        use: [
          {
            loader: "ejs-loader",
            options: {
              esModule: false,
              variable: "data",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    ...htmlPlugins,
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/content",
          to: "content",
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "src/service-worker.js", to: "service-worker.js" }],
    }),
  ],
  devServer: {
    static: path.join(__dirname, "docs"),
    compress: true,
    port: 8000,
    hot: true,
  },
  devtool: "source-map",
};
