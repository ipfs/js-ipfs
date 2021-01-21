'use strict'

/* eslint-env browser */

const { encodeCID } = require('ipfs-message-port-protocol/src/cid')

/**
 * @typedef {import('ipfs-message-port-protocol/src/dag').EncodedCID} EncodedCID
 * @typedef {import('./ipfs').IPFS} IPFS
 */

exports.PinService = class PinService {
  /**
   *
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.ipfs = ipfs
  }

  /**
   * @typedef {Object} PinQuery
   * @property {string} path
   * @property {boolean} [recursive=true]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @typedef {Object} PinResult
   * @property {EncodedCID} cid
   * @property {Transferable[]} transfer
   *
   * @param {PinQuery} input
   * @returns {Promise<PinResult>}
   */
  async add (input) {
    const cid = await this.ipfs.pin.add(input.path, input)
    /** @type {Transferable[]} */
    const transfer = []
    return { cid: encodeCID(cid, transfer), transfer }
  }
}
