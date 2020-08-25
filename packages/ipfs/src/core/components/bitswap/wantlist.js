'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ bitswap }) => {
  /**
   * @typedef {import('cids')} CID
   */

  /**
   * Returns the wantlist for your node
   *
   * @param {object} [options]
   * @param {Number} [options.timeout] - A timeout in ms (default: `undefined`)
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long running requests started as a result of this call (default: `undefined`)
   *
   * @returns {Promise<CID[]>} - An array of CIDs currently in the wantlist
   */
  async function wantlist (options = {}) { // eslint-disable-line require-await
    const list = bitswap.getWantlist(options)

    return Array.from(list).map(e => e[1].cid)
  }

  return withTimeoutOption(wantlist)
}
