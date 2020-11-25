'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const Multiaddr = require('multiaddr')

/**
 * @param {Object} config
 * @param {import('.').Repo} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * Remove all peer addresses from the bootstrap list
   *
   * @param {AbortOptions} options
   * @returns {Promise<Peers>}
   * @example
   * ```js
   * const res = await ipfs.bootstrap.clear()
   * console.log(res.Peers)
   * // Logs:
   * // [address1, address2, ...]
   * ```
   */
  async function clear (options = {}) {
    const config = await repo.config.getAll(options)
    const removed = config.Bootstrap || []
    config.Bootstrap = []

    await repo.config.replace(config)

    return { Peers: removed.map(ma => new Multiaddr(ma)) }
  }

  return withTimeoutOption(clear)
}

/**
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('./utils').Peers} Peers
 */
