'use strict'

const { cleanCid } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipld-block')} Block
 * @typedef {import('ipfs-block-service')} BlockService
 * @typedef {import('../init').PreloadService} Preload
 */

/**
 * @param {Object} config
 * @param {BlockService} config.blockService
 * @param {Preload} config.preload
 * @returns {Get}
 */
module.exports = ({ blockService, preload }) => {
  /**
   * @typedef {Object} Options
   * @property {boolean} [preload]
   *
   * @callback Get
   * @param {CID} cid
   * @param {Options} [options]
   * @returns {Promise<Block>}
   *
   * @type {Get}
   */
  async function get (cid, options) { // eslint-disable-line require-await
    options = options || {}
    cid = cleanCid(cid)

    if (options.preload !== false) {
      preload(cid)
    }

    return blockService.get(cid)
  }

  return withTimeoutOption(get)
}
