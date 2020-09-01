'use strict'

const PeerId = require('peer-id')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('peer-id')} PeerId
 */

/**
 * Returns the wantlist for a connected peer
 * @template {Record<string, any>} ExtraOptions
 * @callback WantlistForPeer
 * @param {PeerId | CID | string | Buffer} peerId - A peer ID to return the wantlist for\
 * @param {import('../../utils').AbortOptions & ExtraOptions} [options]
 * @returns {Promise<CID[]>} - An array of CIDs currently in the wantlist
 */

module.exports = ({ bitswap }) => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {WantlistForPeer<{}>}
   */
  async function wantlistForPeer (peerId, options = {}) { // eslint-disable-line require-await
    const list = bitswap.wantlistForPeer(PeerId.createFromCID(peerId), options)

    return Array.from(list).map(e => e[1].cid)
  }

  return withTimeoutOption(wantlistForPeer)
}
