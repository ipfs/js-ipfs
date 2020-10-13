'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {Object} Peers
 * An object that contains an array with all the removed addresses
 * @property {Array<Multiaddr>} Peers
 *
 * @typedef {Object} ClearOptions
 *
 * @typedef {import('cids')} CID
 * @typedef {import('multiaddr')} Multiaddr
 */

/**
 * Remove all peer addresses from the bootstrap list
 *
 * @template {Record<string, any>} ExtraOptions
 * @callback BootstrapClear
 * @param {import('../../utils').AbortOptions & ClearOptions & ExtraOptions} options
 * @returns {Promise<Peers>}
 * @example
 * ```js
 * const res = await ipfs.bootstrap.clear()
 * console.log(res.Peers)
 * // Logs:
 * // [address1, address2, ...]
 * ```
 */

/**
 * @typedef {import('ipfs-repo')} IPFSRepo
 *
 * @param {IPFSRepo} repo
 */
module.exports = ({ repo }) => {
  /**
   * @type {BootstrapClear<{}>}
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
