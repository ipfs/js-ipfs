import { CID } from 'multiformats/cid'
import { encodeCID, decodeCID } from './cid.js'

/**
 * @typedef {import('./data').JSONValue} JSONValue
 */

/**
 * @template T
 * @typedef {import('./data').StringEncoded<T>} StringEncoded
 */

/**
 * @typedef {JSONValue} DAGNode
 * @typedef {Object} EncodedDAGNode
 * @property {DAGNode} dagNode
 * @property {CID[]} cids
 */

/**
 * @param {EncodedDAGNode} encodedNode
 * @returns {DAGNode}
 */
export const decodeNode = ({ dagNode, cids }) => {
  // It is not ideal to have to mutate prototype chains like
  // this, but it removes a need of traversing node first on client
  // and now on server.
  for (const cid of cids) {
    decodeCID(cid)
  }

  return dagNode
}

/**
 * Encodes DAG node for over the message channel transfer by collecting all
 * the CID instances into an array so they could be turned back into CIDs
 * without traversal on the other end.
 *
 * If `transfer` array is provided all the encountered `ArrayBuffer`s within
 * this node will be added to transfer so they are moved across without copy.
 *
 * @param {DAGNode} dagNode
 * @param {Set<Transferable>} [transfer]
 * @returns {EncodedDAGNode}
 */
export const encodeNode = (dagNode, transfer) => {
  /** @type {CID[]} */
  const cids = []
  collectNode(dagNode, cids, transfer)
  return { dagNode, cids }
}

/**
 * Recursively traverses passed `value` and collects encountered `CID` instances
 * into provided `cids` array. If `transfer` array is passed collects all the
 * `ArrayBuffer`s into it.
 *
 * @param {DAGNode} value
 * @param {CID[]} cids
 * @param {Set<Transferable>} [transfer]
 * @returns {void}
 */
const collectNode = (value, cids, transfer) => {
  if (value != null && typeof value === 'object') {
    const cid = CID.asCID(value)

    if (cid) {
      cids.push(cid)
      encodeCID(cid, transfer)
    } else if (value instanceof ArrayBuffer) {
      if (transfer) {
        transfer.add(value)
      }
    } else if (ArrayBuffer.isView(value)) {
      if (transfer) {
        transfer.add(value.buffer)
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
