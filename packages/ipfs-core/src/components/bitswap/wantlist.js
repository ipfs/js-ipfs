'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 */

/**
 * Returns the wantlist for your node
 * @template {Record<string, any>} ExtraOptions
 * @callback WantlistFn
 * @param {import('../../utils').AbortOptions & ExtraOptions} [options]
 * @returns {Promise<CID[]>} - An array of CIDs currently in the wantlist
 */

module.exports = ({ bitswap }) => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {WantlistFn<{}>}
   */
  async function wantlist (options = {}) { // eslint-disable-line require-await
    const list = bitswap.getWantlist(options)

    return Array.from(list).map(e => e[1].cid)
  }

  return withTimeoutOption(wantlist)
}
