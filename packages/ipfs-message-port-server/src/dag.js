'use strict'

const CID = require('cids')
const { collect } = require('./util')

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/data').StringEncoded<T>} StringEncoded
 */
/**
 * @typedef {import('./ipfs').IPFS} IPFS
 * @typedef {import('ipfs-message-port-protocol/src/dag').DAGAPI} DAGAPI
 * @typedef {import('ipfs-message-port-protocol/src/dag').DAGNode} DAGNode
 * @typedef {import('ipfs-message-port-protocol/src/dag').PutDAG} PutDAG
 * @typedef {import('ipfs-message-port-protocol/src/dag').GetDAG} GetDAG
 * @typedef {import('ipfs-message-port-protocol/src/dag').DAGEntry} DAGEntry
 * @typedef {import('ipfs-message-port-protocol/src/dag').EnumerateDAG} EnumerateDAG
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
   *
   * @param {PutDAG} query
   * @returns {Promise<StringEncoded<CID>>}
   */
  async put (query) {
    const { dagNode, format, hashAlg, pin, preload, timeout, signal } = query
    const cid = await this.ipfs.dag.put(dagNode, {
      format,
      hashAlg,
      pin,
      preload,
      timeout,
      signal
    })
    return cid.toString()
  }

  /**
   * @param {GetDAG} query
   * @returns {Promise<DAGEntry>}
   */
  async get (query) {
    const { cid, path, localResolve, timeout, signal } = query
    const result = await this.ipfs.dag.get(new CID(cid), path, {
      localResolve,
      timeout,
      signal
    })
    return result
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
