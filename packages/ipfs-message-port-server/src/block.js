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
   * @property {EncodedCID|void} [cid]
   * @property {string} [format]
   * @property {string} [mhtype]
   * @property {number} [mhlen]
   * @property {number} [version]
   * @property {boolean} [pin]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * Stores input as an IPFS block.
   *
   * @param {PutQuery} query
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
   * @typedef {Object} RmQuery
   * @property {EncodedCID[]} cids
   * @property {boolean} [force]
   * @property {boolean} [quiet]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @typedef {RmEntry[]} RmResult
   *
   * @typedef {Object} RmEntry
   * @property {EncodedCID} cid
   * @property {EncodedError|undefined} [error]
   *
   * Remove one or more IPFS block(s).
   * @param {RmQuery} query
   * @returns {Promise<RmResult>}
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
   * @typedef {Object} StatResult
   * @property {EncodedCID} cid
   * @property {number} size
   *
   * Gets information of a raw IPFS block.
   *
   * @param {StatQuery} query
   * @returns {Promise<StatResult>}
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
