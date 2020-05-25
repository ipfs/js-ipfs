'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('ipfs-interface').LibP2PService} LibP2PService
 * @typedef {import('multiaddr')} Multiaddr
 * @typedef {import('ipfs-interface').Address} Address
 * @typedef {import('interface-connection').Connection} Connection
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 */

/**
 * @typedef {Object} SwarmConfig
 * @property {LibP2PService} libp2p
 *
 * @typedef {Object} SwarmAddrs
 * @property {string} id
 * @property {Multiaddr[]} addrs
 */
/**
 * @param {SwarmConfig} config
 * @returns {Addrs}
 */
module.exports = ({ libp2p }) => {
  /**
   * @callback Addrs
   * @param {WithTimeoutOptions} [options]
   * @returns {Promise<SwarmAddrs[]>}
   *
   * @type {Addrs}
   */
  async function addrs (options) { // eslint-disable-line require-await
    const peers = []
    for (const [peerId, peerInfo] of libp2p.peerStore.peers.entries(options)) {
      peers.push({
        id: peerId,
        addrs: peerInfo.multiaddrs.toArray()
      })
    }
    return peers
  }

  return withTimeoutOption(addrs)
}
