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
   * Get a raw IPFS block.
   *
   * @param {CID | string | Uint8Array} cid - A CID that corresponds to the desired block
   * @param {GetOptions & AbortOptions} [options]
   * @returns {Promise<IPLDBlock>} - A Block type object, containing both the data and the hash of the block
   *
   * @example
   * ```js
   * const block = await ipfs.block.get(cid)
   * console.log(block.data)
   * ```
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

/**
 * @typedef {Object} GetOptions
 * @property {boolean} [preload=true]
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('.').CID} CID
 * @typedef {import('.').IPLDBlock} IPLDBlock
 */
