'use strict'

const { parseArgs } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {Object} GetOptions
 * @property {boolean} [localResolve=false]
 * @property {number} [timeout]
 * @property {boolean} [preload=false]
 * @property {AbortSignal} [signal]
 *
 * @typedef {Object} DagEntry
 * @property {Object} value
 * @property {string} remainderPath
 */

/**
 * @param {{ipld:any, preload:any}} config
 * @returns {*}
 */
module.exports = ({ ipld, preload }) => {
  /**
   * Retrieve an IPLD format node
   * @param {CID} cid - A DAG node that follows one of the supported IPLD formats
   * @param {string} [path] - An optional path within the DAG to resolve
   * @param {GetOptions} [options] - An optional configration
   * @returns {Promise<DagEntry>}
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

      return result
    }
  }

  return withTimeoutOption(get)
}
