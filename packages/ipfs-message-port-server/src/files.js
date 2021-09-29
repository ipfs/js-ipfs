
/* eslint-env browser */

import { encodeCID } from 'ipfs-message-port-protocol/cid'

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 * @typedef {import('ipfs-core-types/src/files').StatOptions} StatOptions
 * @typedef {import('ipfs-message-port-protocol/src/files').EncodedStat} EncodedStat
 */

export class FilesService {
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
   *
   * @param {StatOptions & StatQuery} input
   */
  async stat (input) {
    const stat = await this.ipfs.files.stat(input.path, input)
    /** @type {Set<Transferable>} */
    const transfer = new Set()
    return { stat: { ...stat, cid: encodeCID(stat.cid, transfer) }, transfer }
  }
}
