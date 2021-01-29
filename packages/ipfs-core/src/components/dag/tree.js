'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  /**
   * Enumerate all the entries in a graph
   *
   * @param {CID} ipfsPath - A DAG node that follows one of the supported IPLD formats
   * @param {TreeOptions & AbortOptions} [options]
   * @returns {AsyncIterable<string>}
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
   * const result = await ipfs.dag.tree('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5')
   * console.log(result)
   * // Logs:
   * // a
   * // b
   * // b/0
   * // b/1
   * // b/2
   * // c
   * // c/ca
   * // c/ca/0
   * // c/ca/1
   * // c/ca/2
   * // c/cb
   * ```
   */
  async function * tree (ipfsPath, options = {}) { // eslint-disable-line require-await
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

    yield * ipld.tree(cid, options.path, options)
  }

  return withTimeoutOption(tree)
}

/**
 * @typedef {Object} TreeOptions
 * @property {string} [path] - If `ipfsPath` is a `CID`, you may pass a path here
 * @property {boolean} [preload]
 *
 * @typedef {Object} TreeResult
 * @property {CID} cid - The last CID encountered during the traversal
 * @property {string} remainderPath - The path to the end of the IPFS path
 * inside the node referenced by the CID
 *
 * @typedef {import('.').CID} CID
 * @typedef {import('.').AbortOptions} AbortOptions
 */
