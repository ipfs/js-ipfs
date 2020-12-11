'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const first = require('it-first')
const last = require('it-last')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

/**
 * @param {Object} config
 * @param {import('..').IPLD} config.ipld
 * @param {import('..').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  /**
   * Retrieve an IPLD format node
   *
   * @example
   * ```js
   * // example obj
   * const obj = {
   *   a: 1,
   *   b: [1, 2, 3],
   *   c: {
   *     ca: [5, 6, 7],
   *     cb: 'foo'
   *   }
   * }
   *
   * const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })
   * console.log(cid.toString())
   * // zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5
   *
   * async function getAndLog(cid, path) {
   *   const result = await ipfs.dag.get(cid, { path })
   *   console.log(result.value)
   * }
   *
   * await getAndLog(cid, '/a')
   * // Logs:
   * // 1
   *
   * await getAndLog(cid, '/b')
   * // Logs:
   * // [1, 2, 3]
   *
   * await getAndLog(cid, '/c')
   * // Logs:
   * // {
   * //   ca: [5, 6, 7],
   * //   cb: 'foo'
   * // }
   *
   * await getAndLog(cid, '/c/ca/1')
   * // Logs:
   * // 6
   * ```
   *
   * @param {CID|string} ipfsPath - A DAG node that follows one of the supported IPLD formats
   * @param {GetOptions & AbortOptions} [options] - An optional configration
   * @returns {Promise<DagEntry>}
   */
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
      const entry = options.localResolve
        ? await first(ipld.resolve(cid, options.path))
        : await last(ipld.resolve(cid, options.path))
      /** @type {DagEntry} - first and last will return undefined when empty */
      const result = (entry)
      return result
    }

    return {
      value: await ipld.get(cid, options),
      remainderPath: ''
    }
  }

  return withTimeoutOption(get)
}

/**
 * @typedef {Object} GetOptions
 * @property {boolean} [localResolve=false]
 * @property {number} [timeout]
 * @property {boolean} [preload=false]
 * @property {string} [path] - An optional path within the DAG to resolve
 *
 * @typedef {Object} DagEntry
 * @property {Object} value
 * @property {string} remainderPath
 *
 * @typedef {import('.').CID} CID
 * @typedef {import('.').AbortOptions} AbortOptions
 */
