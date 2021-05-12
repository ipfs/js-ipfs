'use strict'

const createWantlist = require('./wantlist')
const createWantlistForPeer = require('./wantlist-for-peer')
const createUnwant = require('./unwant')
const createStat = require('./stat')

/**
 * @typedef {import('../../types').NetworkService} NetworkService
 * @typedef {import('peer-id')} PeerId
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

class BitswapAPI {
  /**
   * @param {Object} config
   * @param {NetworkService} config.network
   */
  constructor ({ network }) {
    this.wantlist = createWantlist({ network })
    this.wantlistForPeer = createWantlistForPeer({ network })
    this.unwant = createUnwant({ network })
    this.stat = createStat({ network })
  }
}
module.exports = BitswapAPI
