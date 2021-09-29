import { Client } from './client.js'
import { encodeCID, decodeCID } from 'ipfs-message-port-protocol/cid'
import { encodeNode, decodeNode } from 'ipfs-message-port-protocol/dag'

/**
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs-message-port-protocol/src/cid').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-server').DAGService} DagService
 * @typedef {import('./client').MessageTransport} MessageTransport
 * @typedef {import('./interface').MessagePortClientOptions} MessagePortClientOptions
 * @typedef {import('ipfs-core-types/src/dag').API<MessagePortClientOptions>} DAGAPI
 */

/**
 * @class
 * @extends {Client<DagService>}
 */
export class DAGClient extends Client {
  /**
   * @param {MessageTransport} transport
   */
  constructor (transport) {
    super('dag', ['put', 'get', 'resolve'], transport)
  }
}

/**
 * @type {DAGAPI["put"]}
 */
DAGClient.prototype.put = async function put (dagNode, options = {}) {
  const encodedCID = await this.remote.put({
    ...options,
    dagNode: encodeNode(dagNode, options.transfer)
  })

  return decodeCID(encodedCID)
}

/**
 * @type {DAGAPI["get"]}
 */
DAGClient.prototype.get = async function get (cid, options = {}) {
  const { value, remainderPath } = await this.remote.get({
    ...options,
    cid: encodeCID(cid, options.transfer)
  })

  return { value: decodeNode(value), remainderPath }
}

/**
 * @type {DAGAPI["resolve"]}
 */
DAGClient.prototype.resolve = async function resolve (cid, options = {}) {
  const { cid: encodedCID, remainderPath } = await this.remote.resolve({
    ...options,
    cid: encodeCIDOrPath(cid, options.transfer)
  })

  return { cid: decodeCID(encodedCID), remainderPath }
}

/**
 * @param {string|CID} input
 * @param {Set<Transferable>} [transfer]
 * @returns {string|EncodedCID}
 */
const encodeCIDOrPath = (input, transfer) => {
  if (typeof input === 'string') {
    return input
  } else {
    return encodeCID(input, transfer)
  }
}
