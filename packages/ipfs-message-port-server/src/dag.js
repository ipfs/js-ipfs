'use strict'

const CID = require('cids')
const { collect } = require('./util')

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/data').StringEncoded<T>} StringEncoded
 */
/**
 * @typedef {import('./ipfs').IPFS} IPFS
 * @typedef {import('ipfs-message-port-protocol/src/data').JSONValue} JSONValue
 * @typedef {import('ipfs-message-port-protocol/src/dag').DAGAPI} DAGAPI
 * @typedef {import('ipfs-message-port-protocol/src/dag').PutDAG} PutDAG
 * @typedef {import('ipfs-message-port-protocol/src/dag').GetDAG} GetDAG
 * @typedef {import('ipfs-message-port-protocol/src/dag').EnumerateDAG} EnumerateDAG
 *
 * @typedef {Object} ToJSON
 * @property {function():JSONValue} toJSON
 *
 * @typedef {ToJSON|JSONValue} DAGNode
 *
 * @typedef {Object} DAGEntry
 * @property {DAGNode} value
 * @property {string} remainderPath
 */

/**
 * @class
 */
class DAG {
  /**
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.ipfs = ipfs
  }

  /**
   * @param {Object} query
   * @param {JSONValue} query.dagNode
   * @param {string} [query.format]
   * @param {string} [query.hashAlg]
   * @param {StringEncoded<CID>|void} [query.cid]
   * @param {boolean} [query.pin]
   * @param {boolean} [query.preload]
   * @param {number} [query.timeout]
   * @param {AbortSignal} [query.signal]
   * @returns {Promise<StringEncoded<CID>>}
   */
  async put (query) {
    const cid = await this.ipfs.dag.put(query.dagNode, query)
    return cid.toString()
  }

  /**
   * @typedef {Object} GetResult
   * @property {Transferable[]} transfer
   * @property {string} remainderPath
   * @property {DAGNode} value
   *
   * @param {GetDAG} query
   * @returns {Promise<GetResult>}
   */
  async get (query) {
    const { cid, path, localResolve, timeout, signal } = query
    const { value, remainderPath } = await this.ipfs.dag.get(
      new CID(cid),
      path,
      {
        localResolve,
        timeout,
        signal
      }
    )

    const transfer = ArrayBuffer.isView(value) ? [value.buffer] : []
    return { remainderPath, value, transfer }
  }

  /**
   * @param {EnumerateDAG} query
   * @returns {Promise<string[]>}
   */
  async tree (query) {
    const { cid, path, recursive, timeout, signal } = query
    const result = await this.ipfs.dag.tree(new CID(cid), path, {
      recursive,
      timeout,
      signal
    })
    return await collect(result)
  }
}
exports.DAG = DAG
