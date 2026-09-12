const path = require("path");

module.exports = {
  mode: "none",
  devtool: false,
  entry: "./src/app.js",
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "assets/js"),
  },
};
