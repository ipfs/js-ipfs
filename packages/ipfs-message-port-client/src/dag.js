'use strict'

const { Client } = require('./client')
const { encodeCID, decodeCID } = require('ipfs-message-port-protocol/src/cid')
const { encodeNode, decodeNode } = require('ipfs-message-port-protocol/src/dag')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-message-port-server/src/dag').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-server/src/dag').DAGNode} DAGNode
 * @typedef {import('ipfs-message-port-server/src/dag').EncodedDAGNode} EncodedDAGNode
 * @typedef {import('ipfs-message-port-server/src/dag').DAGEntry} DAGEntry
 * @typedef {import('ipfs-message-port-server/src/dag').DAGService} DagService
 * @typedef {import('./client').ClientTransport} Transport
 */

/**
 * @class
 * @extends {Client<DagService>}
 */
class DAGClient extends Client {
  /**
   * @param {Transport} transport
   */
  constructor (transport) {
    super('dag', ['put', 'get', 'resolve', 'tree'], transport)
  }

  /**
   * @param {DAGNode} dagNode
   * @param {Object} [options]
   * @param {string} [options.format="dag-cbor"] - The IPLD format multicodec
   * @param {string} [options.hashAlg="sha2-256"] - The hash algorithm to be used over the serialized DAG node
   * @param {CID} [options.cid]
   * @param {boolean} [options.pin=false] - Pin this node when adding to the blockstore
   * @param {boolean} [options.preload=true]
   * @param {Transferable[]} [options.transfer] - References to transfer to the
   * @param {number} [options.timeout] - A timeout in ms
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long running requests started as a result of this call.
   * @returns {Promise<CID>}
   */
  async put (dagNode, options = {}) {
    const { cid } = options

    const encodedCID = await this.remote.put({
      ...options,
      dagNode: encodeNode(dagNode, options.transfer),
      cid: cid != null ? encodeCID(cid) : undefined
    })

    return decodeCID(encodedCID)
  }

  /**
   * @param {CID} cid
   * @param {Object} [options]
   * @param {string} [options.path]
   * @param {boolean} [options.localResolve]
   * @param {number} [options.timeout]
   * @param {Transferable[]} [options.transfer] - References to transfer to the
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<DAGEntry>}
   */
  async get (cid, options = {}) {
    const { value, remainderPath } = await this.remote.get({
      ...options,
      cid: encodeCID(cid, options.transfer)
    })

    return { value: decodeNode(value), remainderPath }
  }

  /**
   * @typedef {Object} ResolveResult
   * @property {CID} cid
   * @property {string|void} remainderPath
   *
   * @param {CID} cid
   * @param {Object} [options]
   * @param {string} [options.path]
   * @param {number} [options.timeout]
   * @param {Transferable[]} [options.transfer] - References to transfer to the
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<ResolveResult>}
   */
  async resolve (cid, options = {}) {
    const { cid: encodedCID, remainderPath } = await this.remote.resolve({
      ...options,
      cid: encodeCIDOrPath(cid, options.transfer)
    })

    return { cid: decodeCID(encodedCID), remainderPath }
  }

  /**
   * Enumerate all the entries in a graph
   * @param {CID} cid - CID of the DAG node to enumerate
   * @param {Object} [options]
   * @param {string} [options.path]
   * @param {boolean} [options.recursive]
   * @param {Transferable[]} [options.transfer] - References to transfer to the
   * @param {number} [options.timeout]
   * @param {AbortSignal} [options.signal]
   * @returns {AsyncIterable<string>}
   */
  async * tree (cid, options = {}) {
    const paths = await this.remote.tree({
      ...options,
      cid: encodeCID(cid, options.transfer)
    })

    yield * paths
  }
}

/**
 * @param {string|CID} input
 * @param {Transferable[]} [transfer]
 * @returns {string|EncodedCID}
 */
const encodeCIDOrPath = (input, transfer) => {
  if (typeof input === 'string') {
    return input
  } else {
    return encodeCID(input, transfer)
  }
}

module.exports = DAGClient
