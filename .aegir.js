'use strict'

const path = require('path')

module.exports = {
  webpack: {
    resolve: {
      alias: {
        'node-forge': path.resolve(
          path.dirname(require.resolve('libp2p-crypto')),
          '../vendor/forge.bundle.js'
        )
      }
    },
    externals: {
      fs: '{}',
      mkdirp: '{}'
    }
  }
}
