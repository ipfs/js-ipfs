'use strict'

const { Client } = require('./client')
const { encodeCID, decodeCID } = require('ipfs-message-port-protocol/src/cid')
const { decodeError } = require('ipfs-message-port-protocol/src/error')
const {
  encodeBlock,
  decodeBlock
} = require('ipfs-message-port-protocol/src/block')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-message-port-server/src/block').Block} Block
 * @typedef {import('ipfs-message-port-server/src/block').EncodedBlock} EncodedBlock
 * @typedef {import('ipfs-message-port-server/src/block').Rm} EncodedRmEntry
 * @typedef {import('ipfs-message-port-server/src/block').BlockService} BlockService
 * @typedef {import('./client').ClientTransport} Transport
 */

/**
 * @class
 * @extends {Client<BlockService>}
 */
class BlockClient extends Client {
  /**
   * @param {Transport} transport
   */
  constructor (transport) {
    super('block', ['put', 'get', 'rm', 'stat'], transport)
  }

  /**
   * Get a raw IPFS block.
   * @param {CID} cid - A CID that corresponds to the desired block
   * @param {Object} [options]
   * @param {number} [options.timeout] - A timeout in ms
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long
   * running requests started as a result of this call
   * @param {Transferable[]} [options.transfer] - References to transfer to the
   * worker if passed.
   * @returns {Promise<Block>}
   */
  async get (cid, options = {}) {
    const { transfer } = options
    const { block } = await this.remote.get({
      ...options,
      cid: encodeCID(cid, transfer)
    })
    return decodeBlock(block)
  }

  /**
   * Stores input as an IPFS block.
   * @param {Block|Uint8Array} block - A Block or Uint8Array of block data
   * @param {Object} [options]
   * @param {CID} [options.cid] - A CID to store the block under (if block is
   * `Uint8Array`)
   * @param {string} [options.format='dag-pb'] - The codec to use to create the
   * CID (if block is `Uint8Array`)
   * @param {string} [options.mhtype='sha2-256'] - The hashing algorithm to use
   * to create the CID (if block is `Uint8Array`)
   * @param {0|1} [options.version=0] - The version to use to create the CID
   * (if block is `Uint8Array`)
   * @param {number} [options.mhlen]
   * @param {boolean} [options.pin=false] - If true, pin added blocks recursively
   * @param {number} [options.timeout] - A timeout in ms
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long
   * running requests started as a result of this call
   * @param {Transferable[]} [options.transfer] - References to transfer to the
   * worker if passed.
   * @returns {Promise<Block>}
   */
  async put (block, options = {}) {
    const { transfer } = options
    // @ts-ignore - ipfs-unixfs-importer passes `progress` which causing errors
    // because functions can't be transferred.
    delete options.progress
    const result = await this.remote.put({
      ...options,
      cid: options.cid == null ? undefined : encodeCID(options.cid, transfer),
      block: block instanceof Uint8Array ? block : encodeBlock(block, transfer)
    })
    return decodeBlock(result.block)
  }

  /**
   * Remove one or more IPFS block(s).
   * @param {CID|CID[]} cids - Block(s) to be removed
   * @param {Object} [options]
   * @param {boolean} [options.force=false] - Ignores nonexistent blocks
   * @param {boolean} [options.quiet=false] - Write minimal output
   * @param {number} [options.timeout] - A timeout in ms
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long
   * running requests started as a result of this call
   * @param {Transferable[]} [options.transfer] - References to transfer to the
   * worker if passed.
   * @returns {AsyncIterable<RmEntry>}
   *
   * @typedef {Object} RmEntry
   * @property {CID} cid
   * @property {Error|void} [error]
   */
  async * rm (cids, options = {}) {
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
   * Returns information about a raw IPFS block.
   * @param {CID} cid - Block to get information about.
   * @param {Object} [options]
   * @param {number} [options.timeout] - A timeout in ms
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long
   * running requests started as a result of this call
   * @param {Transferable[]} [options.transfer] - References to transfer to the
   * worker if passed.
   * @returns {Promise<Stat>}
   *
   * @typedef {Object} Stat
   * @property {CID} cid
   * @property {number} size
   */
  async stat (cid, options = {}) {
    const { transfer } = options
    const result = await this.remote.stat({
      ...options,
      cid: encodeCID(cid, transfer)
    })

    return { ...result, cid: decodeCID(result.cid) }
  }
}

/**
 * @param {EncodedRmEntry} entry
 * @returns {RmEntry}
 */
const decodeRmEntry = entry => {
  const cid = decodeCID(entry.cid)
  if (entry.error) {
    return { cid, error: decodeError(entry.error) }
  } else {
    return { cid }
  }
}

module.exports = BlockClient
