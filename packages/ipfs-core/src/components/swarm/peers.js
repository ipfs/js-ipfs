'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * Local addresses this node is listening on.
   *
   * @param {PeersOptions & AbortOptions} [options]
   * @returns {Promise<PeerConnection[]>}
   */
  async function peers (options = {}) {
    const { libp2p } = await network.use(options)
    const verbose = options.v || options.verbose
    const peers = []

    for (const [peerId, connections] of libp2p.connections) {
      for (const connection of connections) {
        const tupple = {
          addr: connection.remoteAddr,
          peer: peerId
        }

        if (verbose || options.direction) {
          tupple.direction = connection.stat.direction
        }

        if (verbose) {
          tupple.muxer = connection.stat.multiplexer
          tupple.latency = 'n/a'
        }

        peers.push(tupple)
      }
    }

    return peers
  }

  return withTimeoutOption(peers)
}

/**
 * @typedef {Object} PeerConnection
 * @property {Multiaddr} addr
 * @property {string} peer
 * @property {string} [latency]
 * @property {string} [muxer]
 * @property {number} [direction]
 *
 * @typedef {Object} PeersOptions
 * @property {boolean} [direction=false]
 * @property {boolean} [streams=false]
 * @property {boolean} [verbose=false]
 * @property {boolean} [v=false]
 * @property {boolean} [latency=false]
 *
 * @typedef {import('.').Multiaddr} Multiaddr
 * @typedef {import('.').AbortOptions} AbortOptions
 */
