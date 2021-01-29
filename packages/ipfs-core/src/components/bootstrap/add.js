'use strict'

const { isValidMultiaddr } = require('./utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').Repo} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * Add a peer address to the bootstrap list
   *
   * @param {Multiaddr} multiaddr - The address of a network peer
   * @param {AbortOptions} [options]
   * @returns {Promise<Peers>}
   * @example
   * ```js
   * const validIp4 = '/ip4/104....9z'
   *
   * const res = await ipfs.bootstrap.add(validIp4)
   * console.log(res.Peers)
   * // Logs:
   * // ['/ip4/104....9z']
   * ```
   */
  async function add (multiaddr, options = {}) {
    if (!isValidMultiaddr(multiaddr)) {
      throw new Error(`${multiaddr} is not a valid Multiaddr`)
    }

    const config = await repo.config.getAll(options)

    // @ts-ignore - May not have `Bootstrap`
    if (config.Bootstrap.indexOf(multiaddr.toString()) === -1) {
      // @ts-ignore - May not have `Bootstrap`
      config.Bootstrap.push(multiaddr.toString())
    }

    await repo.config.replace(config)

    return {
      Peers: [multiaddr]
    }
  }

  return withTimeoutOption(add)
}

/**
 * @typedef {import('./utils').Peers} Peers
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('.').CID} CID
 * @typedef {import('.').Multiaddr} Multiaddr
 */
