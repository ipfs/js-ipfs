'use strict'

const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: [
    './index.js'
  ],
  plugins: [
    new UglifyJsPlugin({
      sourceMap: true,
      uglifyOptions: {
        mangle: false,
        compress: false
      }
    }),
    new HtmlWebpackPlugin({
      title: 'IPFS Videostream example',
      template: 'index.html'
    })
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}
