'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * Open a connection to a given address.
   *
   * @param {import('.').Multiaddr} addr
   * @param {import('.').AbortOptions} [options]
   * @returns {Promise<void>}
   */
  async function connect (addr, options) {
    const { libp2p } = await network.use(options)
    return libp2p.dial(addr, options)
  }

  return withTimeoutOption(connect)
}
