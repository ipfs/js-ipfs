'use strict'

module.exports = {
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel-loader']
    }]
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
}
