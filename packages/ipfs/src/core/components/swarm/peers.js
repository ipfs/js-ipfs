'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {Object} PeersConfig
 * @property {*} libp2p
 *
 * @typedef {Object} PeersOptions
 * @property {boolean} [v]
 * @property {boolean} [verbose]
 * @property {boolean} [direction]
 *
 * @param {PeersConfig} config
 * @returns {Peers}
 */
module.exports = ({ libp2p }) => {
  /**
   * @callback Peers
   * @param {PeersOptions} [options]
   *
   * @type {Peers}
   */
  async function peers (options) { // eslint-disable-line require-await
    options = options || {}

    const verbose = options.v || options.verbose
    const peers = []

    for (const [peerId, connections] of libp2p.connections) {
      for (const connection of connections) {
        /** @type {{addr:any, peer:any, direction?:any, muxer?:any, latency?:string}} */
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
