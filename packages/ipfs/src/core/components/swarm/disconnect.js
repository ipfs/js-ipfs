'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @param {*} config
 * @returns {*}
 */
module.exports = ({ libp2p }) => {
  /**
   * @param {*} addr
   * @returns {*}
   */
  function disconnect (addr, options) {
    return libp2p.hangUp(addr)
  }

  return withTimeoutOption(disconnect)
}
