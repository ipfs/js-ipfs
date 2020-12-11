'use strict'

const { isValidMultiaddr } = require('./utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').Repo} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * Remove a peer address from the bootstrap list
   *
   * @param {Multiaddr} multiaddr - The address of a network peer
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
  async function rm (multiaddr, options = {}) {
    if (!isValidMultiaddr(multiaddr)) {
      throw new Error(`${multiaddr} is not a valid Multiaddr`)
    }

    const config = await repo.config.getAll(options)
    config.Bootstrap = (config.Bootstrap || []).filter(ma => ma.toString() !== multiaddr.toString())

    await repo.config.replace(config)

    return { Peers: [multiaddr] }
  }

  return withTimeoutOption(rm)
}

/**
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('.').Multiaddr} Multiaddr
 * @typedef {import('./utils').Peers} Peers
 */
