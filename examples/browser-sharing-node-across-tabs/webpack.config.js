'use strict'

const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  devtool: 'eval',
  mode: 'development',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/main'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'static/bundle.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin({
      patterns: [{
        from: 'index.html'
      }]
    }),
    // fixes Module not found: Error: Can't resolve 'stream' in '.../node_modules/nofilter/lib'
    new NodePolyfillPlugin(),
    // Note: stream-browserify has assumption about `Buffer` global in its
    // dependencies causing runtime errors. This is a workaround to provide
    // global `Buffer` until https://github.com/isaacs/core-util-is/issues/29
    // is fixed.
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    esmodules: true
                  }
                }
              ]
            ]
          }
        }
      }
    ]
  }
}
