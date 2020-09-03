'use strict'

const { cleanCid } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipld-block')} Block
 */

/**
 * @typedef {object} PreloadOptions
 * @property {boolean} [preload] - (default: `true`)
 */

/**
 * Get a raw IPFS block.
 * @template {Record<string, any>} ExtraOptions
 * @callback BlockGet
 * @param {CID | string | Buffer} cid - A CID that corresponds to the desired block
 * @param {import('../../utils').AbortOptions & ExtraOptions} [options]
 * @returns {Promise<Block>} - A Block type object, containing both the data and the hash of the block
 */

module.exports = ({ blockService, preload }) => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {BlockGet<PreloadOptions>}
   */
  async function get (cid, options) { // eslint-disable-line require-await
    options = options || {}
    cid = cleanCid(cid)

    if (options.preload !== false) {
      preload(cid)
    }

    return blockService.get(cid, options)
  }

  return withTimeoutOption(get)
}
