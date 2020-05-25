'use strict'

const pkgversion = require('../../../package.json').version
const multiaddr = require('multiaddr')
const { withTimeoutOption } = require('../utils')

/**
 * @typedef {import("peer-info")} PeerInfo
 * @typedef {import('multiaddr')} Multiaddr
 * @typedef {import("./init").LibP2P} LibP2P
 */

/**
 * @param {Object} config
 * @param {PeerInfo} config.peerInfo
 * @param {LibP2P} config.libp2p
 * @returns {ID}
 */
module.exports = ({ peerInfo, libp2p }) => {
  /**
   * @typedef {Object} IDInfo
   * @property {string} id
   * @property {string} publicKey
   * @property {Multiaddr[]} addresses
   * @property {string} agentVersion
   * @property {string} protocolVersion
   *
   * @callback ID
   * @returns {IDInfo}
   *
   * @type {ID}
   */
  async function id () { // eslint-disable-line require-await
    const id = peerInfo.id.toB58String()
    /** @type {Multiaddr[]} */
    let addresses = []

    if (libp2p) {
      // only available while the node is running
      addresses = libp2p.transportManager.getAddrs()
    }

    return {
      id,
      publicKey: peerInfo.id.pubKey.bytes.toString('base64'),
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
      protocolVersion: '9000'
    }
  }

  return withTimeoutOption(id)
}
