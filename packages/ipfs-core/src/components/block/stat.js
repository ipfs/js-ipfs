'use strict'

const { cleanCid } = require('./utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').BlockService} config.blockService
 * @param {import('.').Preload} config.preload
 */

module.exports = ({ blockService, preload }) => {
  /**
  /**
   * Print information of a raw IPFS block.
   *
   * @param {CID} cid - CID of the block to get a stats for.
   * @param {StatOptions & AbortOptions} options
   * @returns {Promise<Stat>}
   * @example
   * ```js
   * const cid = CID.from('QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ')
   * const stats = await ipfs.block.stat(cid)
   * console.log(stats.cid.toString())
   * // Logs: QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ
   * console.log(stat.size)
   * // Logs: 3739
   * ```
   */
  async function stat (cid, options = {}) {
    cid = cleanCid(cid)

    if (options.preload !== false) {
      preload(cid)
    }

    const block = await blockService.get(cid)

    return { cid, size: block.data.length }
  }

  return withTimeoutOption(stat)
}

/**
 * @typedef {Object} Stat
 * An object containing the block's info
 * @property {CID} cid
 * @property {number} size
 *
 * @typedef {Object} StatOptions
 * @property {boolean} [preload]
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('.').CID} CID
 */
