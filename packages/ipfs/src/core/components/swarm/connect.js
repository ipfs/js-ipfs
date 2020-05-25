'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('ipfs-interface').LibP2PService} LibP2PService
 * @typedef {import('ipfs-interface').Address} Address
 * @typedef {import('interface-connection').Connection} Connection
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 */

/**
 * @typedef {Object} SwarmConfig
 * @property {LibP2PService} libp2p
 */
/**
 * @param {SwarmConfig} config
 * @returns {Connect}
 */
module.exports = ({ libp2p }) => {
  /**
   * @callback Connect
   * @param {Address} addr
   * @param {WithTimeoutOptions} [options]
   * @returns {Promise<Connection>}
   * @type {Connect}
   */
  function connect (addr, options) {
    return libp2p.dial(addr, options)
  }

  return withTimeoutOption(connect)
}
