var webpack = require("webpack");

module.exports = {
  entry: ['./src/game.js'],
  output: {
    filename: 'build/bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ]
};
