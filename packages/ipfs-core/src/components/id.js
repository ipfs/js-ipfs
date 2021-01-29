'use strict'

const pkgversion = require('../../package.json').version
const multiaddr = require('multiaddr')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const uint8ArrayToString = require('uint8arrays/to-string')

/**
 * @param {Object} config
 * @param {import('.').PeerId} config.peerId
 * @param {import('.').NetworkService} config.network
 */
module.exports = ({ peerId, network }) => {
  /**
   * Returns the identity of the Peer
   *
   * @param {import('../utils').AbortOptions} [_options]
   * @returns {Promise<ID>}
   * @example
   * ```js
   * const identity = await ipfs.id()
   * console.log(identity)
   * ```
   */
  async function id (_options) { // eslint-disable-line require-await
    const id = peerId.toB58String()
    let addresses = []
    let protocols = []

    const net = network.try()

    if (net) {
      const { libp2p } = net
      // only available while the node is running
      addresses = libp2p.multiaddrs
      protocols = Array.from(libp2p.upgrader.protocols.keys())
    }

    return {
      id,
      publicKey: uint8ArrayToString(peerId.pubKey.bytes, 'base64pad'),
      addresses: addresses
        .map(ma => {
          const str = ma.toString()

          // some relay-style transports add our peer id to the ma for us
          // so don't double-add
          if (str.endsWith(`/p2p/${id}`)) {
            return str
          }

          return `${str}/p2p/${id}`
        })
        .sort()
        .map(ma => multiaddr(ma)),
      agentVersion: `js-ipfs/${pkgversion}`,
      protocolVersion: '9000',
      protocols: protocols.sort()
    }
  }
  return withTimeoutOption(id)
}

/**
 * @typedef {object} ID
 * The Peer identity
 * @property {string} id - the Peer ID
 * @property {string} publicKey - the public key of the peer as a base64 encoded string
 * @property {import('multiaddr')[]} addresses - A list of multiaddrs this node is listening on
 * @property {string} agentVersion - The agent version
 * @property {string} protocolVersion - The supported protocol version
 * @property {string[]} protocols - The supported protocols
 */
