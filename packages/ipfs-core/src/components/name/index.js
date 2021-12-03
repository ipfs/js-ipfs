import { createPublish } from './publish.js'
import { createResolve } from './resolve.js'
import { PubSubAPI } from './pubsub/index.js'

export class NameAPI {
  /**
   * @param {Object} config
   * @param {import('../ipns').IPNSAPI} config.ipns
   * @param {import('peer-id')} config.peerId
   * @param {import('../../types').Options} config.options
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
   * @param {import('ipfs-core-types/src/root').API<{}>["isOnline"]} config.isOnline
   * @param {import('libp2p/src/keychain')} config.keychain
   * @param {import('ipfs-core-types/src/root').API<{}>["dns"]} config.dns
   */
  constructor ({ dns, ipns, repo, codecs, peerId, isOnline, keychain, options }) {
    this.publish = createPublish({ ipns, repo, codecs, peerId, isOnline, keychain })
    this.resolve = createResolve({ dns, ipns, peerId, isOnline, options })
    this.pubsub = new PubSubAPI({ ipns, options })
  }
}
