'use strict'

const pkgversion = require('../../package.json').version
const multiaddr = require('multiaddr')
const { withTimeoutOption } = require('../utils')
const uint8ArrayToString = require('uint8arrays/to-string')
const PeerId = require('peer-id')
const { NotStartedError } = require('../errors')

/**
 * @param {Object} config
 * @param {import('peer-id')} config.peerId
 * @param {import('libp2p')} [config.libp2p]
 */
module.exports = ({ peerId, libp2p }) => {
  /**
   * Returns the identity of the Peer
   *
   * @param {IdOptions} [options]
   * @returns {Promise<PeerId>}
   * @example
   * ```js
   * const identity = await ipfs.id()
   * console.log(identity)
   * ```
   */
  async function id (options = {}) { // eslint-disable-line require-await
    options = options || {}

    let id = peerId
    let publicKey = id.pubKey
    let addresses = []
    let protocols = []
    let agentVersion = `js-ipfs/${pkgversion}`
    let protocolVersion = '9000'

    if (options.peerId) {
      if (PeerId.isPeerId(options.peerId)) {
        id = options.peerId
      } else {
        id = PeerId.createFromB58String(options.peerId.toString())
      }

      if (!libp2p) {
        throw new NotStartedError()
      }

      publicKey = libp2p.peerStore.keyBook.get(id)
      addresses = libp2p.peerStore.addressBook.getMultiaddrsForPeer(id) || []
      protocols = libp2p.peerStore.protoBook.get(id) || []

      const meta = libp2p.peerStore.metadataBook.get(id) || {}
      agentVersion = meta.agentVersion
      protocolVersion = meta.protocolVersion
    } else {
      if (libp2p) {
        // only available while the node is running
        addresses = libp2p.transportManager.getAddrs()
        protocols = Array.from(libp2p.upgrader.protocols.keys())
      }
    }

    const idStr = id.toB58String()

    return {
      id: idStr,
      publicKey: publicKey ? uint8ArrayToString(publicKey.bytes, 'base64pad') : undefined,
      addresses: addresses
        .map(ma => {
          const str = ma.toString()

          // some relay-style transports add our peer id to the ma for us
          // so don't double-add
          if (str.endsWith(`/p2p/${idStr}`)) {
            return str
          }

          return `${str}/p2p/${idStr}`
        })
        .sort()
        .map(ma => multiaddr(ma)),
      agentVersion,
      protocolVersion,
      protocols: protocols.sort()
    }
  }
  return withTimeoutOption(id)
}

/**
 * @typedef {object} PeerId
 * The Peer identity
 * @property {string} id - the Peer ID
 * @property {string} publicKey - the public key of the peer as a base64 encoded string
 * @property {import('multiaddr')[]} addresses - A list of multiaddrs this node is listening on
 * @property {string} agentVersion - The agent version
 * @property {string} protocolVersion - The supported protocol version
 * @property {string[]} protocols - The supported protocols
 *
 * @typedef {IdSettings & AbortOptions} IdOptions
 *
 * @typedef {Object} IdSettings
 * @property {string|PeerId} [peerId] - The address of a remote peer
 *
 * @typedef {import('../utils').AbortOptions} AbortOptions
 */
