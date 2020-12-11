'use strict'

const defaultConfig = require('../../runtime/config-nodejs.js')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const Multiaddr = require('multiaddr')

/**
 * @param {Object} config
 * @param {import('.').Repo} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * List all peer addresses in the bootstrap list
   *
   * @param {AbortOptions} options
   * @returns {Promise<Peers>}
   * @example
   * ```js
   * const res = await ipfs.bootstrap.list()
   * console.log(res.Peers)
   * // Logs:
   * // [address1, address2, ...]
   * ```
   */
  async function reset (options = {}) {
    const config = await repo.config.getAll(options)
    config.Bootstrap = defaultConfig().Bootstrap

    await repo.config.replace(config)

    return {
      Peers: defaultConfig().Bootstrap.map(ma => new Multiaddr(ma))
    }
  }

  return withTimeoutOption(reset)
}

/**
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('./utils').Peers} Peers
 */
