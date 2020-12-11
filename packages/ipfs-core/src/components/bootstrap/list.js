'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const Multiaddr = require('multiaddr')

/**
 * @param {Object} config
 * @param {import('.').Repo} config.repo
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
    /** @type {string[]|null} */
    const peers = (await repo.config.get('Bootstrap', options))
    return { Peers: (peers || []).map(ma => new Multiaddr(ma)) }
  }

  return withTimeoutOption(list)
}

/**
 * @typedef {import('./utils').Peers} Peers
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('.').CID} CID
 */
