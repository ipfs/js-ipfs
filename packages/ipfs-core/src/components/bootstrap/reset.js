'use strict'

const defaultConfig = require('../../runtime/config-nodejs.js')
const { withTimeoutOption } = require('../../utils')
const Multiaddr = require('multiaddr')

/**
 * @typedef {Object} Peers
 * An object that contains an array with all the bootstrap addresses
 * @property {Array<Multiaddr>} Peers
 *
 * @typedef {Object} ResetOptions
 *
 * @typedef {import('cids')} CID
 * @typedef {import('multiaddr')} Multiaddr
 */

/**
 * List all peer addresses in the bootstrap list
 *
 * @template {Record<string, any>} ExtraOptions
 * @callback BootstrapReset
 * @param {import('../../utils').AbortOptions & ResetOptions & ExtraOptions} options
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
   * @type {BootstrapReset<{}>}
   */
  async function reset (options = {}) {
    const config = await repo.config.getAll(options)
    config.Bootstrap = defaultConfig().Bootstrap

    await repo.config.set(config)

    return {
      Peers: defaultConfig().Bootstrap.map(ma => new Multiaddr(ma))
    }
  }

  return withTimeoutOption(reset)
}
