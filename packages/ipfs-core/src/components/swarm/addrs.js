'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * List of known addresses of each peer connected.
   *
   * @param {import('../../utils').AbortOptions} options
   * @returns {Promise<PeerInfo[]>}
   */
  async function addrs (options) { // eslint-disable-line require-await
    const peers = []
    const { libp2p } = await network.use(options)
    for (const [peerId, peer] of libp2p.peerStore.peers.entries()) {
      peers.push({
        id: peerId,
        addrs: peer.addresses.map((mi) => mi.multiaddr)
      })
    }
    return peers
  }

  return withTimeoutOption(addrs)
}

/**
 * @typedef {Object} PeerInfo
 * @property {string} id
 * @property {Multiaddr[]} addrs
 *
 * @typedef {import('.').Multiaddr} Multiaddr
 */
