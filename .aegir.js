'use strict'

const path = require('path')

module.exports = {
  webpack: {
    resolve: {
      alias: {
        'libp2p-ipfs': 'libp2p-ipfs-browser',
        'node-forge': path.resolve(
          path.dirname(require.resolve('libp2p-crypto')),
          '../vendor/forge.bundle.js'
        )
      }
    },
    externals: {
      mkdirp: '{}',
      glob: '{}',
      'simple-websocket-server': '{}'
    }
  }
}
