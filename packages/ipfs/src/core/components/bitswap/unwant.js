'use strict'

const CID = require('cids')
const errCode = require('err-code')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('ipfs-bitswap')} BitSwap
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 */

/**
 * @typedef {Object} Config
 * @property {BitSwap} bitswap
 *
 * @param {Config} config
 * @returns {Unwant}
 */
module.exports = ({ bitswap }) => {
  /**
   * @callback Unwant
   * @param {CID[]|CID} keys
   * @param {WithTimeoutOptions} [options]
   * @returns {Promise<void>}
   *
   * @type {Unwant}
   */
  async function unwant (keys, options) { // eslint-disable-line require-await
    if (!Array.isArray(keys)) {
      keys = [keys]
    }

    try {
      keys = keys.map((key) => new CID(key))
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }

    // @ts-ignore - ipfs-bitswap does not expect options
    return bitswap.unwant(keys, options)
  }

  return withTimeoutOption(unwant)
}
