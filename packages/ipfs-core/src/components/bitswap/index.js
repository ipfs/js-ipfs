'use strict'

const createWantlist = require('./wantlist')
const createWantlistForPeer = require('./wantlist-for-peer')
const createUnwant = require('./unwant')
const createStat = require('./stat')

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

/**
 * @typedef {import('..').NetworkService} NetworkService
 * @typedef {import('..').PeerId} PeerId
 * @typedef {import('..').CID} CID
 * @typedef {import('..').AbortOptions} AbortOptions
 */
