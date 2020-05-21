'use strict'

const { parseArgs } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @template T
 * @typedef {import("ipld").ResolvedIPLDNode<T>} ResolvedIPLDNode
 */
/**
 * @typedef {import('cids')} CID
 * @typedef {import("ipfs-interface").PreloadService} PreloadService
 * @typedef {import("ipfs-interface").IPLDService} IPLDService
 * @typedef {Object} Config
 * @property {IPLDService} ipld
 * @property {PreloadService} preload
 *
 * @typedef {Object} ResloveOptions
 * @property {boolean} [preload]
 * @property {AbortSignal} [signal]
 */

/**
 * @param {Config} config
 * @returns {*}
 */
module.exports = ({ ipld, preload }) => {
  /**
   * @param {string|Buffer|CID} cid
   * @param {string} [path]
   * @param {ResloveOptions} [options]
   * @returns {AsyncIterable<ResolvedIPLDNode<Object>>}
   */
  async function * resolve (cid, path, options) { // eslint-disable-line require-await
    [cid, path, options] = parseArgs(cid, path, options)

    if (options.preload !== false) {
      preload(cid)
    }

    yield * ipld.resolve(cid, path, { signal: options.signal })
  }
  return withTimeoutOption(resolve)
}
