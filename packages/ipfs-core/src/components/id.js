'use strict'

const pkgversion = require('../../package.json').version
const { Multiaddr } = require('multiaddr')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const uint8ArrayToString = require('uint8arrays/to-string')
const PeerId = require('peer-id')
const { NotStartedError } = require('../errors')

/**
 * @param {Object} config
 * @param {import('peer-id')} config.peerId
 * @param {import('../types').NetworkService} config.network
 */
module.exports = ({ peerId, network }) => {
  /**
   * @type {import('ipfs-core-types/src/root').API["id"]}
   */
  async function id (options = {}) { // eslint-disable-line require-await
    /** @type {Multiaddr[]} */
    let addresses = []
    /** @type {string[]} */
    let protocols = []
    let agentVersion = `js-ipfs/${pkgversion}`
    let protocolVersion = '9000'
    let id = peerId
    let publicKey = id.pubKey

    const net = network.try()

    if (options.peerId) {
      if (!net) {
        throw new NotStartedError()
      }

      const { libp2p } = net

      id = PeerId.createFromB58String(options.peerId.toString())

      publicKey = libp2p.peerStore.keyBook.get(id)
      addresses = libp2p.peerStore.addressBook.getMultiaddrsForPeer(id) || []
      protocols = libp2p.peerStore.protoBook.get(id) || []

      const meta = libp2p.peerStore.metadataBook.get(id) || {}
      agentVersion = meta.agentVersion
      protocolVersion = meta.protocolVersion
    }

    if (net) {
      const { libp2p } = net

      // only available while the node is running
      addresses = libp2p.multiaddrs
      protocols = Array.from(libp2p.upgrader.protocols.keys())
    }

    const idStr = id.toB58String()

    return {
      id: idStr,
      publicKey: uint8ArrayToString(publicKey.bytes, 'base64pad'),
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
        .map(ma => new Multiaddr(ma)),
      agentVersion,
      protocolVersion,
      protocols: protocols.sort()
    }
  }
  return withTimeoutOption(id)
}
