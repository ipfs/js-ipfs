'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * Local addresses this node is listening on.
   *
   * @param {import('.').AbortOptions} [options]
   * @returns {Promise<Multiaddr[]>}
   */
  async function localAddrs (options) {
    const { libp2p } = await network.use(options)
    return libp2p.multiaddrs
  }

  return withTimeoutOption(localAddrs)
}

/**
 * @typedef {import('.').Multiaddr} Multiaddr
 */
