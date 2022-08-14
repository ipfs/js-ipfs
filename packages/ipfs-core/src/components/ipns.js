import { IPNS } from '../ipns/index.js'
import { createRouting } from '../ipns/routing/config.js'
import { OfflineDatastore } from '../ipns/routing/offline-datastore.js'
import { NotInitializedError, AlreadyInitializedError } from '../errors.js'
import { logger } from '@libp2p/logger'

const log = logger('ipfs:components:ipns')

/**
 * @typedef {import('@libp2p/interface-peer-id').PeerId} PeerId
 * @typedef {import('@libp2p/interfaces').AbortOptions} AbortOptions
 *
 * @typedef {object} ExperimentalOptions
 * @property {boolean} [ipnsPubsub]
 *
 * @typedef {object} LibP2POptions
 * @property {DHTConfig} [config]
 *
 * @typedef {object} DHTConfig
 * @property {boolean} [enabled]
 */

export class IPNSAPI {
  /**
   * @param {object} options
   * @param {string} options.pass
   * @param {boolean} [options.offline]
   * @param {LibP2POptions} [options.libp2p]
   * @param {ExperimentalOptions} [options.EXPERIMENTAL]
   */
  constructor (options = { pass: '' }) {
    this.options = options

    /** @type {IPNS | null} */
    this.offline = null

    /** @type {IPNS | null} */
    this.online = null
  }

  getIPNS () {
    const ipns = this.online || this.offline
    if (ipns) {
      return ipns
    } else {
      throw new NotInitializedError()
    }
  }

  get routing () {
    return this.getIPNS().routing
  }

  /**
   * Activates IPNS subsystem in an ofline mode. If it was started once already
   * it will throw an exception.
   *
   * This is primarily used for offline ipns modifications, such as the
   * initializeKeyspace feature.
   *
   * @param {object} config
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   * @param {import('@libp2p/interface-peer-id').PeerId} config.peerId
   * @param {import('@libp2p/interface-keychain').KeyChain} config.keychain
   */
  startOffline ({ repo, peerId, keychain }) {
    if (this.offline != null) {
      throw new AlreadyInitializedError()
    }

    log('initializing IPNS keyspace (offline)')

    const routing = new OfflineDatastore(repo.datastore)
    const ipns = new IPNS(routing, repo.datastore, peerId, keychain, this.options)

    this.offline = ipns
  }

  /**
   * @param {object} config
   * @param {import('libp2p').Libp2p} config.libp2p
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   * @param {import('@libp2p/interface-peer-id').PeerId} config.peerId
   * @param {import('@libp2p/interface-keychain').KeyChain} config.keychain
   */
  async startOnline ({ libp2p, repo, peerId, keychain }) {
    if (this.online != null) {
      throw new AlreadyInitializedError()
    }
    const routing = createRouting({ libp2p, repo, peerId, options: this.options })

    // @ts-expect-error routing is a TieredDatastore which wants keys to be Keys, IPNS needs keys to be Uint8Arrays
    const ipns = new IPNS(routing, repo.datastore, peerId, keychain, this.options)
    await ipns.republisher.start()
    this.online = ipns
  }

  async stop () {
    const ipns = this.online
    if (ipns) {
      await ipns.republisher.stop()
      this.online = null
    }
  }

  /**
   * @param {PeerId} peerId
   * @param {Uint8Array} value
   * @param {number} lifetime
   * @param {AbortOptions} [options]
   */
  publish (peerId, value, lifetime, options) {
    return this.getIPNS().publish(peerId, value, lifetime, options)
  }

  /**
   *
   * @param {string} name
   * @param {object} [options]
   * @param {boolean} [options.nocache]
   * @param {boolean} [options.recursive]
   * @param {AbortSignal} [options.signal]
   */
  resolve (name, options) {
    return this.getIPNS().resolve(name, options)
  }

  /**
   * @param {PeerId} peerId
   * @param {Uint8Array} value
   * @param {AbortOptions} [options]
   */
  initializeKeyspace (peerId, value, options) {
    return this.getIPNS().initializeKeyspace(peerId, value, options)
  }
}
