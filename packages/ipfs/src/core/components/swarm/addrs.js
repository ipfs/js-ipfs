'use strict'

module.exports = ({ libp2p }) => {
  return async function addrs () { // eslint-disable-line require-await
    const peers = []
    for (const [peerId, peer] of libp2p.peerStore.peers.entries()) {
      peers.push({
        id: peerId,
        addrs: peer.addresses.map((mi) => mi.multiaddr)
      })
    }
    return peers
  }
}
