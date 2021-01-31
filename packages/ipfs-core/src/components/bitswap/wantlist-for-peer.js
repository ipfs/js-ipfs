'use strict'

const PeerId = require('peer-id')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * Returns the wantlist for a connected peer
   *
   * @example
   * ```js
   * const list = await ipfs.bitswap.wantlistForPeer(peerId)
   * console.log(list)
   * // [ CID('QmHash') ]
   * ```
   *
   * @param {PeerId | CID | string | Uint8Array} peerId - A peer ID to return the wantlist for\
   * @param {AbortOptions} [options]
   * @returns {Promise<CID[]>} - An array of CIDs currently in the wantlist
   *
   */
  async function wantlistForPeer (peerId, options = {}) {
    const { bitswap } = await network.use(options)
    const list = bitswap.wantlistForPeer(PeerId.createFromCID(peerId), options)

    return Array.from(list).map(e => e[1].cid)
  }

  return withTimeoutOption(wantlistForPeer)
}

/**
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('.').CID} CID
 */

/**
 * @template ExtraOptions
 * @callback WantlistForPeer
 * @param {PeerId | CID | string | Uint8Array} peerId
 * @param {AbortOptions & ExtraOptions} [options]
 * @returns {Promise<CID[]>}
 */
