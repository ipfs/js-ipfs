'use strict'

const defaultConfig = require('../../runtime/config-nodejs.js')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { Multiaddr } = require('multiaddr')

/**
 * @param {Object} config
 * @param {import('ipfs-repo')} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * @type {import('ipfs-core-types/src/bootstrap').API["reset"]}
   */
  async function reset (options = {}) {
    /** @type {import('ipfs-core-types/src/config').Config} */
    // @ts-ignore repo returns type unknown
    const config = await repo.config.getAll(options)
    config.Bootstrap = defaultConfig().Bootstrap

    await repo.config.replace(config)

    return {
      Peers: defaultConfig().Bootstrap.map(ma => new Multiaddr(ma))
    }
  }

  return withTimeoutOption(reset)
}
