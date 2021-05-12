'use strict'

const collect = require('it-all')
const { encodeError } = require('ipfs-message-port-protocol/src/error')
const { decodeCID, encodeCID } = require('ipfs-message-port-protocol/src/cid')
const {
  decodeBlock,
  encodeBlock
} = require('ipfs-message-port-protocol/src/block')

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-message-port-protocol/src/error').EncodedError} EncodedError
 * @typedef {import('ipfs-message-port-protocol/src/block').Block} Block
 * @typedef {import('ipfs-message-port-protocol/src/cid').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-protocol/src/block').EncodedBlock} EncodedBlock
 * @typedef {import('ipfs-message-port-protocol/src/block').EncodedRmResult} EncodedRmResult
 * @typedef {import('ipfs-core-types/src/block').PutOptions} PutOptions
 */

exports.BlockService = class BlockService {
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
   * @typedef {Object} GetQuery
   * @property {EncodedCID} cid
   * @property {number} [timeout]
   * @property {AbortSignal} [query.signal]
   *
   * @param {GetQuery} query
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
   * @typedef {Object} PutQuery
   * @property {EncodedBlock|Uint8Array} block
   * @property {EncodedCID|undefined} [cid]
   *
   * Stores input as an IPFS block.
   *
   * @param {PutOptions & PutQuery} query
   * @returns {Promise<PutResult>}
   */
  async put (query) {
    const input = query.block
    let result
    /** @type {Uint8Array|Block} */
    if (input instanceof Uint8Array) {
      result = await this.ipfs.block.put(input, {
        ...query,
        cid: query.cid ? decodeCID(query.cid) : query.cid
      })
    } else {
      const block = decodeBlock(input)
      result = await this.ipfs.block.put(block, {
        ...query,
        cid: undefined
      })
    }

    /** @type {Transferable[]} */
    const transfer = []
    return { transfer, block: encodeBlock(result, transfer) }
  }

  /**
   * @typedef {Object} RmQuery
   * @property {EncodedCID[]} cids
   * @property {boolean} [force]
   * @property {boolean} [quiet]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * Remove one or more IPFS block(s).
   * @param {RmQuery} query
   * @returns {Promise<EncodedRmResult[]>}
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
   * @typedef {Object} StatQuery
   * @property {EncodedCID} cid
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @typedef {Object} EncodedStatResult
   * @property {EncodedCID} cid
   * @property {number} size
   *
   * Gets information of a raw IPFS block.
   *
   * @param {StatQuery} query
   * @returns {Promise<EncodedStatResult>}
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
 */
const encodeRmEntry = (entry, transfer) => {
  const cid = encodeCID(entry.cid, transfer)
  if (entry.error) {
    return { cid, error: encodeError(entry.error) }
  } else {
    return { cid }
  }
}
