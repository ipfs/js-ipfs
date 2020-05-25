'use strict'

const { cleanCid } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-block-service')} BlockService
 * @typedef {import('../init').GCLock} GCLock
 * @typedef {import('../init').PreloadService} Preload
 */

/**
 * @typedef {Object} StatConfig
 * @property {BlockService} blockService
 * @property {Preload} preload
 *
 * @param {StatConfig} config
 * @returns {Stat}
 */
module.exports = ({ blockService, preload }) => {
  /**
   * @typedef {Object} BlockStat
   * @property {CID} cid
   * @property {number} size
   *
   * @typedef {Object} StatOptions
   * @property {boolean} [preload]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @callback Stat
   * @param {CID} cid
   * @param {StatOptions} [options]
   * @returns {Promise<BlockStat>}
   *
   * @type {Stat}
   */
  async function stat (cid, options) {
    options = options || {}
    cid = cleanCid(cid)

    if (options.preload !== false) {
      preload(cid)
    }

    const block = await blockService.get(cid)

    return { cid, size: block.data.length }
  }

  return withTimeoutOption(stat)
}
