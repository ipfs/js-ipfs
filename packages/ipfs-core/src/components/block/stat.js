'use strict'

const { cleanCid } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @param {Object} config
 * @param {import('ipfs-block-service')} config.blockService
 * @param {import('../init').Preload} config.preload
 */
module.exports = ({ blockService, preload }) => {
  /**
   * Print information of a raw IPFS block.
   * @param {CID} cid - CID of the block to get a stats for.
   * @param {StatOptions} options
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
 * @typedef {StatSettings & AbortOptions} StatOptions
 *
 * @typedef {Object} StatSettings
 * @property {boolean} [preload]
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 *
 * @typedef {import('cids')} CID
 */
