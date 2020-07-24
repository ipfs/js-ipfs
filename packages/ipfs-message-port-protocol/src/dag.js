'use strict'

const { encodeCID, decodeCID, CID } = require('./cid')

/**
 * @typedef {import('./data').JSONValue} JSONValue
 */

/**
 * @template T
 * @typedef {import('./data').StringEncoded<T>} StringEncoded
 */

/**
 * @typedef {Object} EncodedCID
 * @property {string} codec
 * @property {Uint8Array} multihash
 * @property {number} version
 * @typedef {JSONValue} DAGNode
 *
 * @typedef {Object} EncodedDAGNode
 * @property {DAGNode} dagNode
 * @property {CID[]} cids
 */

/**
 * @param {EncodedDAGNode} encodedNode
 * @returns {DAGNode}
 */
const decodeNode = ({ dagNode, cids }) => {
  // It is not ideal to have to mutate prototype chains like
  // this, but it removes a need of traversing node first on client
  // and now on server.
  for (const cid of cids) {
    decodeCID(cid)
  }

  return dagNode
}

exports.decodeNode = decodeNode

/**
 * Encodes DAG node for over the message channel transfer by collecting all
 * the CID instances into an array so they could be turned back into CIDs
 * without traversal on the other end.
 *
 * If `transfer` array is provided all the encountered `ArrayBuffer`s within
 * this node will be added to transfer so they are moved across without copy.
 * @param {DAGNode} dagNode
 * @param {Transferable[]} [transfer]
 * @returns {EncodedDAGNode}
 */
const encodeNode = (dagNode, transfer) => {
  /** @type {CID[]} */
  const cids = []
  collectNode(dagNode, cids, transfer)
  return { dagNode, cids }
}
exports.encodeNode = encodeNode

/**
 * Recursively traverses passed `value` and collects encountered `CID` instances
 * into provided `cids` array. If `transfer` array is passed collects all the
 * `ArrayBuffer`s into it.
 * @param {DAGNode} value
 * @param {CID[]} cids
 * @param {Transferable[]} [transfer]
 * @returns {void}
 */
const collectNode = (value, cids, transfer) => {
  if (value != null && typeof value === 'object') {
    if (CID.isCID(value)) {
      cids.push(value)
      encodeCID(value, transfer)
    } else if (value instanceof ArrayBuffer) {
      if (transfer) {
        transfer.push(value)
      }
    } else if (ArrayBuffer.isView(value)) {
      if (transfer) {
        transfer.push(value.buffer)
      }
    } else if (Array.isArray(value)) {
      for (const member of value) {
        collectNode(member, cids, transfer)
      }
    } else {
      for (const member of Object.values(value)) {
        collectNode(member, cids, transfer)
      }
    }
  }
}
