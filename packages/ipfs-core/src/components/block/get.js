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
   * Get a raw IPFS block.
   *
   * @param {CID | string | Buffer} cid - A CID that corresponds to the desired block
   * @param {GetOptions} [options]
   * @returns {Promise<Block>} - A Block type object, containing both the data and the hash of the block
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
 * @typedef {PreloadOptions & AbortOptions} GetOptions
 *
 * @typedef {Object} PreloadOptions
 * @property {boolean} [preload=true]
 *
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 * @typedef {import('cids')} CID
 * @typedef {import('ipld-block')} Block
 */
