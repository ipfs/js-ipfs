'use strict'

const createPublishAPI = require('./publish')
const createResolveAPI = require('./resolve')
const PubSubAPI = require('./pubsub')

class NameAPI {
  /**
   * @param {Object} config
   * @param {import('../ipns')} config.ipns
   * @param {import('peer-id')} config.peerId
   * @param {import('../../types').Options} config.options
   * @param {import('ipld')} config.ipld
   * @param {import('ipfs-core-types/src/root').API["isOnline"]} config.isOnline
   * @param {import('libp2p/src/keychain')} config.keychain
   * @param {import('ipfs-core-types/src/root').API["dns"]} config.dns
   */
  constructor ({ dns, ipns, ipld, peerId, isOnline, keychain, options }) {
    this.publish = createPublishAPI({ ipns, ipld, peerId, isOnline, keychain })
    this.resolve = createResolveAPI({ dns, ipns, peerId, isOnline, options })
    this.pubsub = new PubSubAPI({ ipns, options })
  }
}

module.exports = NameAPI
