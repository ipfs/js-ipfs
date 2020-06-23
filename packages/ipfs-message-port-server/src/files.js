'use strict'

/* eslint-env browser */

const { encodeCID } = require('ipfs-message-port-protocol/src/cid')

/**
 * @typedef {import('ipfs-message-port-protocol/src/dag').EncodedCID} EncodedCID
 */
/**
 * @typedef {import('ipfs-message-port-protocol/src/data').HashAlg} HashAlg
 * @typedef {import('ipfs-message-port-protocol/src/data').Mode} Mode
 * @typedef {import('./ipfs').IPFS} IPFS
 * @typedef {Stat} EncodedStat
 */

/**
 * @class
 */
class FilesService {
  /**
   *
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.ipfs = ipfs
  }

  /**
   * @typedef {Object} StatQuery
   * @property {string} path
   * @property {boolean} [hash=false]
   * @property {boolean} [size=false]
   * @property {boolean} [withLocal=false]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @typedef {Object} Stat
   * @property {EncodedCID} cid
   * @property {number} size
   * @property {number} cumulativeSize
   * @property {'file'|'directory'} type
   * @property {number} blocks
   * @property {boolean} withLocality
   * @property {boolean} local
   * @property {number} sizeLocal
   *
   * @typedef {Object} StatResult
   * @property {Stat} stat
   * @property {Transferable[]} transfer
   *
   * @param {StatQuery} input
   * @returns {Promise<StatResult>}
   */
  async stat (input) {
    const stat = await this.ipfs.files.stat(input.path, input)
    /** @type {Transferable[]} */
    const transfer = []
    return { stat: { ...stat, cid: encodeCID(stat.cid, transfer) }, transfer }
  }
}
exports.FilesService = FilesService
