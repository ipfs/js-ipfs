'use strict'

const { parseArgs } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('../init').IPLD} IPLD
 * @typedef {import('../init').PreloadService} PreloadService
 */

/**
 * @param {Object} config
 * @param {IPLD} config.ipld
 * @param {PreloadService} config.preload
 * @returns {Get}
 */
module.exports = ({ ipld, preload }) => {
  /**
   * @typedef {Object} GetOptions
   * @property {boolean} [localResolve=false]
   * @property {number} [timeout]
   * @property {boolean} [preload=false]
   * @property {AbortSignal} [signal]
   *
   * @typedef {Object} DagEntry
   * @property {Object} value
   * @property {string} remainderPath
   *
   * @callback Get
   * Retrieve an IPLD format node
   * @param {CID} cid - A DAG node that follows one of the supported IPLD formats
   * @param {string} [path] - An optional path within the DAG to resolve
   * @param {GetOptions} [options] - An optional configration
   * @returns {Promise<DagEntry>}
   *
   * @type {Get}
   */
  async function get (cid, path, options) {
    [cid, path, options] = parseArgs(cid, path, options)

    if (options.preload !== false) {
      preload(cid)
    }

    if (path == null || path === '/') {
      const value = await ipld.get(cid)

      return {
        value,
        remainderPath: ''
      }
    } else {
      let result

      for await (const entry of ipld.resolve(cid, path)) {
        if (options.localResolve) {
          return entry
        }

        result = entry
      }

      // @ts-ignore - loop above might be empty in which case result will be
      // undefined, so TS points that out.
      return result
    }
  }

  return withTimeoutOption(get)
}
