'use strict'

module.exports = {
  webpack: {
    module: {
      postLoaders: [{
        test: /\.js$/,
        loader: 'transform?brfs',
        exclude: [
          /js-ipfs-api\/test/
        ]
      }]
    }
  }
}
