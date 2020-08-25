'use strict'

const PeerId = require('peer-id')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ bitswap }) => {
  /**
   * @typedef {import('cids')} CID
   * @typedef {import('peer-id')} PeerId
   */

  /**
   * Returns the wantlist for a connected peer
   *
   * @param {PeerId | CID | string | Buffer} peerId - A peer ID to return the wantlist for
   * @param {object} [options]
   * @param {Number} [options.timeout] - A timeout in ms (default: `undefined`)
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long running requests started as a result of this call (default: `undefined`)
   *
   * @returns {Promise<CID[]>} - An array of CIDs currently in the wantlist
   */
  async function wantlistForPeer (peerId, options = {}) { // eslint-disable-line require-await
    const list = bitswap.wantlistForPeer(PeerId.createFromCID(peerId), options)

    return Array.from(list).map(e => e[1].cid)
  }

  return withTimeoutOption(wantlistForPeer)
}
