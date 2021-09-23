import { Client } from './client.js'
import { encodeCID, decodeCID } from 'ipfs-message-port-protocol/cid'
import { decodeError } from 'ipfs-message-port-protocol/error'
import { encodeBlock } from 'ipfs-message-port-protocol/block'

/**
 * @typedef {import('./client').MessageTransport} MessageTransport
 * @typedef {import('ipfs-message-port-server').BlockService} BlockService
 * @typedef {import('./interface').MessagePortClientOptions} MessagePortClientOptions
 * @typedef {import('ipfs-core-types/src/block').API<MessagePortClientOptions>} BlockAPI
 */

/**
 * @class
 * @extends {Client<BlockService>}
 */
export class BlockClient extends Client {
  /**
   * @param {MessageTransport} transport
   */
  constructor (transport) {
    super('block', ['put', 'get', 'rm', 'stat'], transport)
  }
}

/**
 * @type {BlockAPI["get"]}
 */
BlockClient.prototype.get = async function get (cid, options = {}) {
  const { transfer } = options
  const { block } = await this.remote.get({
    ...options,
    cid: encodeCID(cid, transfer)
  })
  return block
}

/**
 * @type {BlockAPI["put"]}
 */
BlockClient.prototype.put = async function put (block, options = {}) {
  const { transfer } = options
  // @ts-ignore - ipfs-unixfs-importer passes `progress` which causing errors
  // because functions can't be transferred.
  delete options.progress
  const result = await this.remote.put({
    ...options,
    // @ts-ignore PutOptions requires CID, we send EncodedCID
    block: block instanceof Uint8Array ? block : encodeBlock(block, transfer)
  })
  return decodeCID(result.cid)
}

/**
 * @type {BlockAPI["rm"]}
 */
BlockClient.prototype.rm = async function * rm (cids, options = {}) {
  const { transfer } = options
  const entries = await this.remote.rm({
    ...options,
    cids: Array.isArray(cids)
      ? cids.map(cid => encodeCID(cid, transfer))
      : [encodeCID(cids, transfer)]
  })

  yield * entries.map(decodeRmEntry)
}

/**
 * @type {BlockAPI["stat"]}
 */
BlockClient.prototype.stat = async function stat (cid, options = {}) {
  const { transfer } = options
  const result = await this.remote.stat({
    ...options,
    cid: encodeCID(cid, transfer)
  })

  return { ...result, cid: decodeCID(result.cid) }
}

/**
 * @param {import('ipfs-message-port-protocol/src/block').EncodedRmResult} entry
 */
const decodeRmEntry = entry => {
  const cid = decodeCID(entry.cid)
  if (entry.error) {
    return { cid, error: decodeError(entry.error) }
  } else {
    return { cid }
  }
}
