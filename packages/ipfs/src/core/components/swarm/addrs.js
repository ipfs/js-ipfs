'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ libp2p }) => {
  return withTimeoutOption(async function addrs (options) { // eslint-disable-line require-await
    const peers = []
    for (const [peerId, peerInfo] of libp2p.peerStore.peers.entries(options)) {
      peers.push({
        id: peerId,
        addrs: peerInfo.multiaddrs.toArray()
      })
    }
    return peers
  })
}
