'use strict'

const { withTimeoutOption } = require('../../utils')
const first = require('it-first')
const last = require('it-last')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipld')} IPLD
 * @typedef {import('../../preload').PreloadService} PreloadService
 */

/**
 * @typedef {Object} GetOptions
 * @property {boolean} [localResolve=false]
 * @property {number} [timeout]
 * @property {boolean} [preload=false]
 * @property {string} [path] - An optional path within the DAG to resolve
 * @property {AbortSignal} [signal]
 *
 * @typedef {Object} DagEntry
 * @property {Object} value
 * @property {string} remainderPath
 *
 * @callback Get
 * Retrieve an IPLD format node
 * @param {CID} cid - A DAG node that follows one of the supported IPLD formats
 * @param {GetOptions} [options] - An optional configration
 * @returns {Promise<DagEntry>}
 */

/**
 * @param {Object} config
 * @param {IPLD} config.ipld
 * @param {PreloadService} config.preload
 * @returns {Get}
 */

module.exports = ({ ipld, preload }) => {
  /** @type {Get} */
  const get = async function get (ipfsPath, options = {}) {
    const {
      cid,
      path
    } = toCidAndPath(ipfsPath)

    if (path) {
      options.path = path
    }

    if (options.preload !== false) {
      preload(cid)
    }

    if (options.path) {
      const result = options.localResolve
      /** @type {DagEntry} - first will return undefined if empty */
        ? (await first(ipld.resolve(cid, options.path)))
      /** @type {DagEntry} - last will return undefined if empty */
        : (await last(ipld.resolve(cid, options.path)))
      return result
    }

    return {
      value: await ipld.get(cid, options),
      remainderPath: ''
    }
  }

  return withTimeoutOption(get)
}
