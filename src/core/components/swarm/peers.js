'use strict'

const CID = require('cids')

module.exports = ({ libp2p }) => {
  return async function peers (options) { // eslint-disable-line require-await
    options = options || {}

    const verbose = options.v || options.verbose
    const peers = []

    for (const [peerId, peerInfo] of libp2p.peerStore.peers.entries()) {
      const connectedAddr = peerInfo.isConnected()

      if (!connectedAddr) continue

      const tupple = {
        addr: connectedAddr,
        peer: new CID(peerId)
      }

      if (verbose) {
        tupple.latency = 'n/a'
      }

      peers.push(tupple)
    }

    return peers
  }
}
