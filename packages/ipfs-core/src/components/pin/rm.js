'use strict'

const last = require('it-last')

/**
 * @param {Object} config
 * @param {ReturnType<typeof import('./rm-all')>} config.rmAll
 */
module.exports = ({ rmAll }) =>
  /**
   * Unpin this block from your repo
   *
   * @param {string|CID} path - CID or IPFS Path to unpin.
   * @param {RmOptions} [options]
   * @returns {Promise<CID>} - The CIDs that was unpinned
   * @example
   * ```js
   * const cid = CID.from('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * const result = await ipfs.pin.rm(cid)
   * console.log(result)
   * // prints the CID that was unpinned
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   */
  async (path, options) =>
    /** @type {CID} - Need to loosen check here because it could be void */
    (await last(rmAll({ path, ...options }, options)))

/**
 * @typedef {RmSettings & AbortOptions} RmOptions
 *
 * @typedef {Object} RmSettings
 * @property {boolean} [recursive=true] - Recursively unpin the object linked
 *
 * @typedef {import('..').CID} CID
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 */
