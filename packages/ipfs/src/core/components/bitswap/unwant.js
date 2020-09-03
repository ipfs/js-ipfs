'use strict'

const CID = require('cids')
const errCode = require('err-code')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 */

/**
 * Removes one or more CIDs from the wantlist
 * @template {Record<string, any>} ExtraOptions
 * @callback Unwant
 * @param {CID | CID[]} cids - The CIDs to remove from the wantlist
 * @param {import('../../utils').AbortOptions & ExtraOptions} [options]
 * @returns {Promise<void>} - A promise that resolves once the request is complete
 */

module.exports = ({ bitswap }) => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {Unwant<{}>}
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
