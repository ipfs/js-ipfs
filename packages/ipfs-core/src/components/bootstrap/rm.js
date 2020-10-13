'use strict'

const { isValidMultiaddr } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {Object} Peers
 * An object that contains an array with all the removed addresses
 * @property {Array<Multiaddr>} Peers
 *
 * @typedef {Object} RmOptions
 *
 * @typedef {import('cids')} CID
 * @typedef {import('multiaddr')} Multiaddr
 */

/**
 * Remove a peer address from the bootstrap list
 *
 * @template {Record<string, any>} ExtraOptions
 * @callback BootstrapRm
 * @param {Multiaddr} multiaddr - The address of a network peer
 * @param {import('../../utils').AbortOptions & RmOptions & ExtraOptions} options
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
   * @type {BootstrapRm<{}>}
   */
  async function rm (multiaddr, options = {}) {
    if (!isValidMultiaddr(multiaddr)) {
      throw new Error(`${multiaddr} is not a valid Multiaddr`)
    }

    const config = await repo.config.getAll(options)
    config.Bootstrap = (config.Bootstrap || []).filter(ma => ma !== multiaddr)

    await repo.config.set(config)

    return { Peers: [multiaddr] }
  }

  return withTimeoutOption(rm)
}
