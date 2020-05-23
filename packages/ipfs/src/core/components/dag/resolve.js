'use strict'

const { parseArgs } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @template T
 * @typedef {import("ipld").ResolvedIPLDNode<T>} ResolvedIPLDNode
 */
/**
 * @typedef {import('cids')} CID
 * @typedef {import('../init').IPLD} IPLD
 * @typedef {import('../init').PreloadService} PreloadService
 * @typedef {Object} Config
 * @property {IPLD} ipld
 * @property {PreloadService} preload
 */

/**
 * @param {Config} config
 * @returns {Resolve}
 */
module.exports = ({ ipld, preload }) => {
  /**
   * @typedef {Object} ResloveOptions
   * @property {boolean} [preload]
   * @property {AbortSignal} [signal]
   *
   * @callback Resolve
   * @param {string|Buffer|CID} cid
   * @param {string=} [path]
   * @param {ResloveOptions=} [options]
   * @returns {AsyncIterable<ResolvedIPLDNode<Object>>}
   *
   * @type {Resolve}
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
