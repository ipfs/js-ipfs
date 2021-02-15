'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('../../types').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * @type {import('ipfs-core-types/src/swarm').API["peers"]}
   */
  async function peers (options = {}) {
    const { libp2p } = await network.use(options)
    const peers = []

    for (const [peerId, connections] of libp2p.connections) {
      for (const connection of connections) {
        /** @type {import('ipfs-core-types/src/swarm').PeersResult} */
        const peer = {
          addr: connection.remoteAddr,
          peer: peerId
        }

        if (options.verbose || options.direction) {
          peer.direction = connection.stat.direction
        }

        if (options.verbose) {
          peer.muxer = connection.stat.multiplexer
          peer.latency = 'n/a'
          peer.streams = [] // TODO: get this from libp2p
        }

        peers.push(peer)
      }
    }

    return peers
  }

  return withTimeoutOption(peers)
}
