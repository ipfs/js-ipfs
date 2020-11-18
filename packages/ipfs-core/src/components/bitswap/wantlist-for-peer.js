'use strict'

const PeerId = require('peer-id')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('..').IPFSBitSwap} config.bitswap
 */
module.exports = ({ bitswap }) => {
  /**
   * Returns the wantlist for a connected peer
   *
   * @param {PeerId | CID | string | Uint8Array} peerId - A peer ID to return the wantlist for\
   * @param {AbortOptions} [options]
   * @returns {Promise<CID[]>} - An array of CIDs currently in the wantlist
   *
   * @example
   * ```js
   * const list = await ipfs.bitswap.wantlistForPeer(peerId)
   * console.log(list)
   * // [ CID('QmHash') ]
   * ```
   */
  async function wantlistForPeer (peerId, options = {}) { // eslint-disable-line require-await
    const list = bitswap.wantlistForPeer(PeerId.createFromCID(peerId), options)

    return Array.from(list).map(e => e[1].cid)
  }

  return withTimeoutOption(wantlistForPeer)
}

/**
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 * @typedef {import('..').CID} CID
 * @typedef {import('..').PeerId} PeerId
 */

/**
 * @template ExtraOptions
 * @callback WantlistForPeer
 * @param {PeerId | CID | string | Uint8Array} peerId
 * @param {AbortOptions & ExtraOptions} [options]
 * @returns {Promise<CID[]>}
 */
