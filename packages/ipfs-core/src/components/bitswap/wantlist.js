'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @param {Object} config
 * @param {import('..').IPFSBitSwap} config.bitswap
 */
module.exports = ({ bitswap }) => {
  /**
   * Returns the wantlist for your node
   *
   * @param {AbortOptions} [options]
   * @returns {Promise<CID[]>} - An array of CIDs currently in the wantlist.
   * @example
   * ```js
   * const list = await ipfs.bitswap.wantlist()
   * console.log(list)
   * // [ CID('QmHash') ]
   * ```
   */
  async function wantlist (options = {}) { // eslint-disable-line require-await
    const list = bitswap.getWantlist(options)

    return Array.from(list).map(e => e[1].cid)
  }

  return withTimeoutOption(wantlist)
}

/**
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 * @typedef {import('..').CID} CID
 */
