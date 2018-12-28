'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  production: true,
  devtool: 'source-map',
  entry: [
    './index.js'
  ],
  plugins: [
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
