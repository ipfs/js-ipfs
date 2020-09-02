'use strict'

const collect = require('it-all')
const { encodeError } = require('ipfs-message-port-protocol/src/error')
const { decodeCID, encodeCID } = require('ipfs-message-port-protocol/src/cid')
const {
  decodeBlock,
  encodeBlock
} = require('ipfs-message-port-protocol/src/block')

/**
 * @typedef {import('./ipfs').IPFS} IPFS
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-message-port-protocol/src/error').EncodedError} EncodedError
 * @typedef {import('ipfs-message-port-protocol/src/block').Block} Block
 * @typedef {import('ipfs-message-port-protocol/src/cid').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-protocol/src/block').EncodedBlock} EncodedBlock
 * @typedef {RmEntry} Rm
 * @typedef {StatResult} Stat
 */

/**
 * @class
 */
class BlockService {
  /**
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.ipfs = ipfs
  }

  /**
   * @typedef {Object} GetResult
   * @property {EncodedBlock} block
   * @property {Transferable[]} transfer
   *
   * @param {Object} query
   * @param {EncodedCID} query.cid
   * @param {number} [query.timeout]
   * @param {AbortSignal} [query.signal]
   * @returns {Promise<GetResult>}
   */
  async get (query) {
    const cid = decodeCID(query.cid)
    const block = await this.ipfs.block.get(cid, query)
    /** @type {Transferable[]} */
    const transfer = []
    return { transfer, block: encodeBlock(block, transfer) }
  }

  /**
   * @typedef {Object} PutResult
   * @property {EncodedBlock} block
   * @property {Transferable[]} transfer
   *
   * Stores input as an IPFS block.
   * @param {Object} query
   * @param {EncodedBlock|Uint8Array} query.block
   * @param {EncodedCID|void} [query.cid]
   * @param {string} [query.format]
   * @param {string} [query.mhtype]
   * @param {number} [query.mhlen]
   * @param {number} [query.version]
   * @param {boolean} [query.pin]
   * @param {number} [query.timeout]
   * @param {AbortSignal} [query.signal]
   * @returns {Promise<PutResult>}
   */
  async put (query) {
    const input = query.block
    /** @type {Uint8Array|Block} */
    const block = input instanceof Uint8Array ? input : decodeBlock(input)
    const result = await this.ipfs.block.put(block, {
      ...query,
      cid: query.cid ? decodeCID(query.cid) : query.cid
    })

    /** @type {Transferable[]} */
    const transfer = []
    return { transfer, block: encodeBlock(result, transfer) }
  }

  /**
   * Remove one or more IPFS block(s).
   * @param {Object} query
   * @param {EncodedCID[]} query.cids
   * @param {boolean} [query.force]
   * @param {boolean} [query.quiet]
   * @param {number} [query.timeout]
   * @param {AbortSignal} [query.signal]
   * @returns {Promise<RmResult>}
   *
   * @typedef {RmEntry[]} RmResult
   *
   * @typedef {Object} RmEntry
   * @property {EncodedCID} cid
   * @property {EncodedError|undefined} [error]
   */
  async rm (query) {
    /** @type {Transferable[]} */
    const transfer = []
    const result = await collect(
      this.ipfs.block.rm(query.cids.map(decodeCID), query)
    )

    return result.map(entry => encodeRmEntry(entry, transfer))
  }

  /**
   * Gets information of a raw IPFS block.
   * @param {Object} query
   * @param {EncodedCID} query.cid
   * @param {number} [query.timeout]
   * @param {AbortSignal} [query.signal]
   * @returns {Promise<StatResult>}
   *
   * @typedef {Object} StatResult
   * @property {EncodedCID} cid
   * @property {number} size
   */
  async stat (query) {
    const cid = decodeCID(query.cid)
    const result = await this.ipfs.block.stat(cid, query)
    return { ...result, cid: encodeCID(result.cid) }
  }
}

/**
 * @param {Object} entry
 * @param {CID} entry.cid
 * @param {Error|void} [entry.error]
 * @param {Transferable[]} transfer
 * @returns {RmEntry}
 */
const encodeRmEntry = (entry, transfer) => {
  const cid = encodeCID(entry.cid, transfer)
  if (entry.error) {
    return { cid, error: encodeError(entry.error) }
  } else {
    return { cid }
  }
}

exports.BlockService = BlockService
