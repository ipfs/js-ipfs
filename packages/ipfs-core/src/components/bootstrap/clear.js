'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { Multiaddr } = require('multiaddr')

/**
 * @param {Object} config
 * @param {import('ipfs-repo')} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * @type {import('ipfs-core-types/src/bootstrap').API["clear"]}
   */
  async function clear (options = {}) {
    /** @type {import('ipfs-core-types/src/config').Config} */
    // @ts-ignore repo returns type unknown
    const config = await repo.config.getAll(options)
    const removed = config.Bootstrap || []
    config.Bootstrap = []

    await repo.config.replace(config)

    return { Peers: removed.map(ma => new Multiaddr(ma)) }
  }

  return withTimeoutOption(clear)
}
