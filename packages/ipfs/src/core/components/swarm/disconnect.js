'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('ipfs-interface').LibP2PService} LibP2P
 * @typedef {import('ipfs-interface').Address} Address
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 */

/**
 * @param {Object} config
 * @param {LibP2P} config.libp2p
 * @returns {Disconnect}
 */
module.exports = ({ libp2p }) => {
  /**
   * @callback Disconnect
   * @param {Address} addr
   * @param {WithTimeoutOptions} [options]
   * @returns {Promise<void>}
   * @type {Disconnect}
   */
  function disconnect (addr, options) {
    return libp2p.hangUp(addr)
  }

  return withTimeoutOption(disconnect)
}
