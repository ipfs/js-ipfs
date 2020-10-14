'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @param {Object} config
 * @param {import('ipfs-repo')} config.repo
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

    await repo.config.set(config)

    return { Peers: removed }
  }

  return withTimeoutOption(clear)
}

/**
 * @typedef {Object} Peers
 * An object that contains an array with all the removed addresses
 * @property {Array<Multiaddr>} Peers
 *
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 *
 * @typedef {import('cids')} CID
 * @typedef {import('multiaddr')} Multiaddr
 */
