'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('ipfs-repo')} IPFSRepo
 *
 * @param {IPFSRepo} repo
 */
module.exports = ({ repo }) => {
  /**
   * List all peer addresses in the bootstrap list
   *
   * @param {AbortOptions} [options]
   * @returns {Promise<Peers>}
   * @example
   * ```js
   * const res = await ipfs.bootstrap.list()
   * console.log(res.Peers)
   * // Logs:
   * // [address1, address2, ...]
   * ```
   */
  async function list (options) {
    const peers = await repo.config.get('Bootstrap', options)
    return { Peers: peers || [] }
  }

  return withTimeoutOption(list)
}

/**
 * @typedef {Object} Peers
 * An object that contains an array with all the bootstrap addresses
 * @property {Array<Multiaddr>} Peers
 *
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 *
 * @typedef {import('cids')} CID
 * @typedef {import('multiaddr')} Multiaddr
 */
