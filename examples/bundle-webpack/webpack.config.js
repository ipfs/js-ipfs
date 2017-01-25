'use strict'

var path = require('path')
var webpack = require('webpack')

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/components/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['react-hot-loader', 'babel-loader'],
      include: path.join(__dirname, 'src')
    }, { test: /\.json$/, loader: 'json-loader' }]
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  /*
   * In order to transfer files, this is a very important step in your Webpack
   * configuration, see more at:
   * https://github.com/ipfs/js-ipfs#use-in-the-browser-with-browserify-webpack-or-any-bundler
   */
  resolve: {
    alias: {
      zlib: 'browserify-zlib-next'
    }
  }

}
