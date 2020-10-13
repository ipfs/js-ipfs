'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {Object} Peers
 * An object that contains an array with all the bootstrap addresses
 * @property {Array<Multiaddr>} Peers
 *
 * @typedef {Object} ListOptions
 *
 * @typedef {import('cids')} CID
 * @typedef {import('multiaddr')} Multiaddr
 */

/**
 * List all peer addresses in the bootstrap list
 *
 * @template {Record<string, any>} ExtraOptions
 * @callback BootstrapList
 * @param {import('../../utils').AbortOptions & ListOptions & ExtraOptions} options
 * @returns {Promise<Peers>}
 * @example
 * ```js
 * const res = await ipfs.bootstrap.list()
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
   * @type {BootstrapList<{}>}
   */
  async function list (options) {
    const peers = await repo.config.get('Bootstrap', options)
    return { Peers: peers || [] }
  }

  return withTimeoutOption(list)
}
