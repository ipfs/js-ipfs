'use strict'

const { cleanCid } = require('./utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipfs-block-service')} config.blockService
 * @param {import('../../types').Preload} config.preload
 */

module.exports = ({ blockService, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/block').API["stat"]}
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
