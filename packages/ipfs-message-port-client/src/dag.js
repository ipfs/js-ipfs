'use strict'

const Client = require('./client')
const { encodeCID, decodeCID } = require('ipfs-message-port-protocol/src/cid')
const { encodeNode, decodeNode } = require('ipfs-message-port-protocol/src/dag')

/**
 * @typedef {import('cids')} CID
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
class DAGClient extends Client {
  /**
   * @param {MessageTransport} transport
   */
  constructor (transport) {
    super('dag', ['put', 'get', 'resolve', 'tree'], transport)
  }
}

/**
 * @type {DAGAPI["put"]}
 */
DAGClient.prototype.put = async function put (dagNode, options = {}) {
  const { cid } = options

  const encodedCID = await this.remote.put({
    ...options,
    encodedCid: cid != null ? encodeCID(cid) : undefined,
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
 * @type {DAGAPI["tree"]}
 */
DAGClient.prototype.tree = async function * tree (cid, options = {}) {
  const paths = await this.remote.tree({
    ...options,
    cid: encodeCID(cid, options.transfer)
  })

  yield * paths
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
