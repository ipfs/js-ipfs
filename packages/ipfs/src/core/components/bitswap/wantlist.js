'use strict'

const PeerId = require('peer-id')
const CID = require('cids')
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
 * @returns {Wantlist}
 */
module.exports = ({ bitswap }) => {
  /**
   * @callback Wantlist
   * @param {PeerId|null} [peerId]
   * @param {WithTimeoutOptions} [options]
   * @returns {Promise<CID[]>}
   *
   * @type {Wantlist}
   */
  async function wantlist (peerId, options = {}) { // eslint-disable-line require-await
    if (peerId && !CID.isCID(peerId) && typeof peerId !== 'string' && !Buffer.isBuffer(peerId) && !PeerId.isPeerId(peerId)) {
      options = peerId
      peerId = null
    }

    const list = peerId
      ? bitswap.wantlistForPeer(PeerId.createFromCID(peerId))
      // @ts-ignore - ipfs-bitswap does not expect options
      : bitswap.getWantlist(options)

    return Array.from(list).map(e => e[1].cid)
  }

  return withTimeoutOption(wantlist)
}
