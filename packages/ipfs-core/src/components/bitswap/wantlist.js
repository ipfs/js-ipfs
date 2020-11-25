'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * Returns the wantlist for your node
   *
   * @example
   * ```js
   * const list = await ipfs.bitswap.wantlist()
   * console.log(list)
   * // [ CID('QmHash') ]
   * ```
   *
   * @param {AbortOptions} [options]
   * @returns {Promise<CID[]>} - An array of CIDs currently in the wantlist.
   */
  async function wantlist (options = {}) {
    const { bitswap } = await network.use(options)
    const list = bitswap.getWantlist(options)

    return Array.from(list).map(e => e[1].cid)
  }

  return withTimeoutOption(wantlist)
}

/**
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('.').CID} CID
 */
