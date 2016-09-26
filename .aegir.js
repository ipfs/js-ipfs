'use strict'

module.exports = {
  webpack: {
    resolve: {
      alias: {
        'libp2p-ipfs': 'libp2p-ipfs-browser'
      }
    },
    externals: {
      mkdirp: '{}',
      glob: '{}',
      'simple-websocket-server': '{}'
    }
  }
}
