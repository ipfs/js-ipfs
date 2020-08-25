'use strict'

const CID = require('cids')
const errCode = require('err-code')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ bitswap }) => {
  /**
   * @typedef {import('cids')} CID
   */

  /**
   * Removes one or more CIDs from the wantlist
   *
   * @param {CID | CID[]} cids - The CIDs to remove from the wantlist
   * @param {object} [options]
   * @param {Number} [options.timeout] - A timeout in ms (default: `undefined`)
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long running requests started as a result of this call (default: `undefined`)
   *
   * @returns {Promise<void>} - A promise that resolves once the request is complete
   */
  async function unwant (cids, options) { // eslint-disable-line require-await
    if (!Array.isArray(cids)) {
      cids = [cids]
    }

    try {
      cids = cids.map((cid) => new CID(cid))
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }

    return bitswap.unwant(cids, options)
  }

  return withTimeoutOption(unwant)
}
