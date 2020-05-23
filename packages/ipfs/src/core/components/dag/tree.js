'use strict'

const { parseArgs } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('../init').IPLD} IPLDService
 * @typedef {import('../init').PreloadService} PreloadService
 */

/**
 * @param {Object} config
 * @param {IPLDService} config.ipld
 * @param {PreloadService} config.preload
 * @returns {Tree}
 */
module.exports = ({ ipld, preload }) => {
  /**
   * @typedef {Object} Options
   * @property {boolean} [preload]
   * @property {boolean} [recursive]
   *
   * @callback Tree
   * @param {CID} cid
   * @param {string=} [path]
   * @param {Options=} [options]
   * @returns {AsyncIterable<string>}
   *
   * @type {Tree}
   */
  async function * tree (cid, path, options) { // eslint-disable-line require-await
    [cid, path, options] = parseArgs(cid, path, options)

    if (options.preload !== false) {
      preload(cid)
    }

    yield * ipld.tree(cid, path, options)
  }

  return withTimeoutOption(tree)
}
