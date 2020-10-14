'use strict'

const defaultConfig = require('../../runtime/config-nodejs.js')
const { withTimeoutOption } = require('../../utils')
const Multiaddr = require('multiaddr')

/**
 * @typedef {import('ipfs-repo')} IPFSRepo
 *
 * @param {IPFSRepo} repo
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

    await repo.config.set(config)

    return {
      Peers: defaultConfig().Bootstrap.map(ma => new Multiaddr(ma))
    }
  }

  return withTimeoutOption(reset)
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
