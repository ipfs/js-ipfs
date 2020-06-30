'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ libp2p }) => {
  return withTimeoutOption(async function addrs (options) { // eslint-disable-line require-await
    const peers = []
    for (const [peerId, peer] of libp2p.peerStore.peers.entries(options)) {
      peers.push({
        id: peerId,
        addrs: peer.addresses.map((mi) => mi.multiaddr)
      })
    }
    return peers
  })
}
