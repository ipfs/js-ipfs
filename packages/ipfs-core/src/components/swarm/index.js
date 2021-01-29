'use strict'

const createAddrsAPI = require('./addrs')
const createConnectAPI = require('./connect')
const createDisconnectAPI = require('./disconnect')
const createLocalAddrsAPI = require('./local-addrs')
const createPeersAPI = require('./peers')

class SwarmAPI {
  /**
   * @param {Object} config
   * @param {NetworkService} config.network
   */
  constructor ({ network }) {
    this.addrs = createAddrsAPI({ network })
    this.connect = createConnectAPI({ network })
    this.disconnect = createDisconnectAPI({ network })
    this.localAddrs = createLocalAddrsAPI({ network })
    this.peers = createPeersAPI({ network })
  }
}

module.exports = SwarmAPI

/**
 * @typedef {import('..').NetworkService} NetworkService
 * @typedef {import('..').Multiaddr} Multiaddr
 * @typedef {import('..').AbortOptions} AbortOptions
 */
