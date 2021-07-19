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
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
   * @param {import('ipfs-core-types/src/root').API["isOnline"]} config.isOnline
   * @param {import('libp2p/src/keychain')} config.keychain
   * @param {import('ipfs-core-types/src/root').API["dns"]} config.dns
   */
  constructor ({ dns, ipns, repo, codecs, peerId, isOnline, keychain, options }) {
    this.publish = createPublishAPI({ ipns, repo, codecs, peerId, isOnline, keychain })
    this.resolve = createResolveAPI({ dns, ipns, peerId, isOnline, options })
    this.pubsub = new PubSubAPI({ ipns, options })
  }
}

module.exports = NameAPI
