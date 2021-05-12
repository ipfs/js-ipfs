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
   * @type {import('ipfs-core-types/src/block').API["get"]}
   */
  async function get (cid, options = {}) { // eslint-disable-line require-await
    cid = cleanCid(cid)

    if (options.preload !== false) {
      preload(cid)
    }

    return blockService.get(cid, options)
  }

  return withTimeoutOption(get)
}
