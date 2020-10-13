'use strict'

const { cleanCid } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {Object} Stat
 * An object containing the block's info
 * @property {CID} cid
 * @property {number} size
 *
 * @typedef {Object} StatOptions
 * @property {boolean} [preload]
 *
 * @typedef {import('cids')} CID
 */

/**
 * Print information of a raw IPFS block.
 *
 * @template {Record<string, any>} ExtraOptions
 * @callback BlockStat
 * @param {CID} cid - CID of the block to get a stats for.
 * @param {import('../../utils').AbortOptions & StatOptions & ExtraOptions} options
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

/**
 * @param {Object} config
 * @param {import('ipfs-block-service')} config.blockService
 * @param {import('../init').Preload} config.preload
 */
module.exports = ({ blockService, preload }) => {
  /**
   * @type {BlockStat<{}>}
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
