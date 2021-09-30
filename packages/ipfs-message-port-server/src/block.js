import all from 'it-all'
import { encodeError } from 'ipfs-message-port-protocol/error'
import { decodeCID, encodeCID } from 'ipfs-message-port-protocol/cid'
import { encodeBlock } from 'ipfs-message-port-protocol/block'

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs-message-port-protocol/error').EncodedError} EncodedError
 * @typedef {import('ipfs-message-port-protocol/cid').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-protocol/block').EncodedRmResult} EncodedRmResult
 * @typedef {import('ipfs-core-types/src/block').PutOptions} PutOptions
 */

export class BlockService {
  /**
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.ipfs = ipfs
  }

  /**
   * @typedef {Object} GetResult
   * @property {Uint8Array} block
   * @property {Set<Transferable>} transfer
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
    /** @type {Set<Transferable>} */
    const transfer = new Set()
    return { transfer, block: encodeBlock(block, transfer) }
  }

  /**
   * @typedef {Object} PutResult
   * @property {EncodedCID} cid
   * @property {Set<Transferable>} transfer
   *
   * @typedef {Object} PutQuery
   * @property {Uint8Array} block
   * @property {EncodedCID|undefined} [cid]
   *
   * Stores input as an IPFS block.
   *
   * @param {PutOptions & PutQuery} query
   * @returns {Promise<PutResult>}
   */
  async put (query) {
    const input = query.block
    const result = await this.ipfs.block.put(input, query)
    /** @type {Set<Transferable>} */
    const transfer = new Set()

    return { transfer, cid: encodeCID(result, transfer) }
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
    /** @type {Set<Transferable>} */
    const transfer = new Set()
    const result = await all(
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
 * @param {Set<Transferable>} transfer
 */
const encodeRmEntry = (entry, transfer) => {
  const cid = encodeCID(entry.cid, transfer)
  if (entry.error) {
    return { cid, error: encodeError(entry.error) }
  } else {
    return { cid }
  }
}
