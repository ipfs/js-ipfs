'use strict'

const pkgversion = require('../../../package.json').version
const multiaddr = require('multiaddr')
const { withTimeoutOption } = require('../utils')
const uint8ArrayToString = require('uint8arrays/to-string')

/**
 * @typedef {object} PeerIdObj - An object with the Peer identity
 * @property {string} id - the Peer ID
 * @property {string} publicKey - the public key of the peer as a base64 encoded string
 * @property {import('multiaddr')[]} addresses - A list of multiaddrs this node is listening on
 * @property {string} agentVersion - The agent version
 * @property {string} protocolVersion - The supported protocol version
 * @property {string[]} protocols - The supported protocols
 */

/**
 * Returns the identity of the Peer
 * @template {Record<string, any>} ExtraOptions
 * @callback Id
 * @param {import('../utils').AbortOptions & ExtraOptions} [options]
 * @returns {Promise<PeerIdObj>}
 */

module.exports = ({ peerId, libp2p }) => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {Id<{}>}
   */
  async function id (options) { // eslint-disable-line require-await, @typescript-eslint/no-unused-vars
    const id = peerId.toB58String()
    let addresses = []
    let protocols = []

    if (libp2p) {
      // only available while the node is running
      addresses = libp2p.transportManager.getAddrs()
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
