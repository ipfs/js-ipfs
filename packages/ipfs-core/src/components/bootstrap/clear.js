'use strict'

const { withTimeoutOption } = require('../../utils')
const Multiaddr = require('multiaddr')

/**
 * @param {Object} config
 * @param {import('..').IPFSRepo} config.repo
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

    return { Peers: removed.map(ma => new Multiaddr(ma)) }
  }

  return withTimeoutOption(clear)
}

/**
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 * @typedef {import('./utils').Peers} Peers
 * @typedef {import('..').CID} CID
 * @typedef {import('..').Multiaddr} Multiaddr
 */
