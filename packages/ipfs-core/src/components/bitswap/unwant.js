'use strict'

const CID = require('cids')
const errCode = require('err-code')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('..').IPFSBitSwap} config.bitswap
 */
module.exports = ({ bitswap }) => {
  /**
   * Removes one or more CIDs from the wantlist
   *
   * @param {CID | CID[]} cids - The CIDs to remove from the wantlist
   * @param {AbortOptions} [options]
   * @returns {Promise<void>} - A promise that resolves once the request is complete
   * @example
   * ```JavaScript
   * let list = await ipfs.bitswap.wantlist()
   * console.log(list)
   * // [ CID('QmHash') ]
   *
   * await ipfs.bitswap.unwant(cid)
   *
   * list = await ipfs.bitswap.wantlist()
   * console.log(list)
   * // []
   * ```
   */
  async function unwant (cids, options) { // eslint-disable-line require-await
    if (!Array.isArray(cids)) {
      cids = [cids]
    }

    try {
      cids = cids.map((cid) => new CID(cid))
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }

    return bitswap.unwant(cids, options)
  }

  return withTimeoutOption(unwant)
}

/**
 * @typedef {import('..').CID} CID
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 */
