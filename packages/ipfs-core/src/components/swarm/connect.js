'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('../../types').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * @type {import('ipfs-core-types/src/swarm').API["connect"]}
   */
  async function connect (addr, options = {}) {
    const { libp2p } = await network.use(options)
    await libp2p.dial(addr, options)
  }

  return withTimeoutOption(connect)
}
