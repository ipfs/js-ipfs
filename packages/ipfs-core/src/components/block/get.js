'use strict'

const { cleanCid } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipld-block')} Block
 */

/**
 * Get a raw IPFS block.
 *
 * @template {Record<string, any>} ExtraOptions
 * @callback BlockGet
 * @param {string|Uint8Array|CID} cid - A CID that corresponds to the desired block
 * @param {import('../../utils').AbortOptions & import('../../utils').PreloadOptions & ExtraOptions} [options]
 * @returns {Promise<Block>} - A Block type object, containing both the data and the hash of the block
 *
 * @example
 * ```js
 * const block = await ipfs.block.get(cid)
 * console.log(block.data)
 * ```
 */

/**
 * @param {Object} config
 * @param {import('ipfs-block-service')} config.blockService
 * @param {import('../init').Preload} config.preload
 */
module.exports = ({ blockService, preload }) => {
  /**
   * @type {BlockGet<{}>}
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
