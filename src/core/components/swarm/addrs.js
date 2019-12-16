'use strict'

const CID = require('cids')

module.exports = ({ libp2p }) => {
  return async function addrs () { // eslint-disable-line require-await
    const peers = []
    for (const [peerId, peerInfo] of libp2p.peerStore.entries()) {
      peers.push({ id: new CID(peerId), addrs: peerInfo.multiaddrs.toArray() })
    }
    return peers
  }
}
