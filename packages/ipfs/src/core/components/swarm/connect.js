'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('ipfs-interface').LibP2PService} LibP2PService
 */

/**
 * @typedef {Object} SwarmConfig
 * @property {LibP2PService} libp2p
 */
/**
 * @param {SwarmConfig} config
 * @returns {*}
 */
module.exports = ({ libp2p }) => {
  /**
   * @param {*} addr
   * @returns {*}
   */
  function connect (addr) {
    return libp2p.dial(addr)
  }

  return withTimeoutOption(connect)
}
