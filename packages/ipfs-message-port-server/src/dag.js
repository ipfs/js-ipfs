'use strict'

const { encodeCID, decodeCID } = require('ipfs-message-port-protocol/src/cid')
const { decodeNode, encodeNode } = require('ipfs-message-port-protocol/src/dag')
const collect = require('it-all')

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-message-port-protocol/src/cid').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-protocol/src/dag').EncodedDAGNode} EncodedDAGNode
 * @typedef {import('ipfs-core-types/src/dag').PutOptions} PutOptions
 */

exports.DAGService = class DAGService {
  /**
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.ipfs = ipfs
  }

  /**
   * @typedef {Object} PutDag
   * @property {EncodedDAGNode} dagNode
   * @property {EncodedCID} [encodedCid]
   *
   * @param {PutOptions & PutDag} query
   * @returns {Promise<EncodedCID>}
   */
  async put (query) {
    const dagNode = decodeNode(query.dagNode)

    const cid = await this.ipfs.dag.put(dagNode, {
      ...query,
      cid: query.encodedCid ? decodeCID(query.encodedCid) : undefined
    })
    return encodeCID(cid)
  }

  /**
   * @typedef {Object} EncodedGetResult
   * @property {Transferable[]} transfer
   * @property {string} [remainderPath]
   * @property {EncodedDAGNode} value
   *
   * @typedef {Object} GetDAG
   * @property {EncodedCID} cid
   * @property {string} [path]
   * @property {boolean} [localResolve]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @param {GetDAG} query
   * @returns {Promise<EncodedGetResult>}
   */
  async get (query) {
    const { cid, path, localResolve, timeout, signal } = query
    const { value, remainderPath } = await this.ipfs.dag.get(
      decodeCID(cid),
      {
        path,
        localResolve,
        timeout,
        signal
      }
    )

    /** @type {Transferable[]} */
    const transfer = []
    return { remainderPath, value: encodeNode(value, transfer), transfer }
  }

  /**
   * @typedef {Object} ResolveQuery
   * @property {EncodedCID|string} cid
   * @property {string} [path]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @typedef {Object} EncodedResolveResult
   * @property {EncodedCID} cid
   * @property {string} [remainderPath]
   *
   * @param {ResolveQuery} query
   * @returns {Promise<EncodedResolveResult>}
   */
  async resolve (query) {
    const { cid, remainderPath } =
      await this.ipfs.dag.resolve(decodePathOrCID(query.cid), query)

    return {
      cid: encodeCID(cid),
      remainderPath
    }
  }

  /**
   * @typedef {Object} EnumerateDAG
   * @property {EncodedCID} cid
   * @property {string} [path]
   * @property {boolean} [recursive]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @param {EnumerateDAG} query
   * @returns {Promise<string[]>}
   */
  async tree (query) {
    const { cid, path, recursive, timeout, signal } = query
    const result = await this.ipfs.dag.tree(decodeCID(cid), {
      path,
      recursive,
      timeout,
      signal
    })
    const entries = await collect(result)

    return entries
  }
}

/**
 * @param {EncodedCID|string} input
 * @returns {CID|string}
 */
const decodePathOrCID = (input) => {
  if (typeof input === 'string') {
    return input
  } else {
    return decodeCID(input)
  }
}
