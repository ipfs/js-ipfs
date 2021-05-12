'use strict'

const IPNS = require('../ipns')
const routingConfig = require('../ipns/routing/config')
const OfflineDatastore = require('../ipns/routing/offline-datastore')
const { NotInitializedError, AlreadyInitializedError } = require('../errors')
const log = require('debug')('ipfs:components:ipns')

/**
 * @typedef {import('libp2p-crypto').PrivateKey} PrivateKey
 *
 * @typedef {Object} ExperimentalOptions
 * @property {boolean} [ipnsPubsub]
 *
 * @typedef {Object} LibP2POptions
 * @property {DHTConfig} [config]
 *
 * @typedef {Object} DHTConfig
 * @property {boolean} [enabled]
 */

class IPNSAPI {
  /**
   * @param {Object} options
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
   * @param {Object} config
   * @param {import('ipfs-repo')} config.repo
   * @param {import('peer-id')} config.peerId
   * @param {import('libp2p/src/keychain')} config.keychain
   */
  startOffline ({ repo, peerId, keychain }) {
    if (this.offline != null) {
      throw new AlreadyInitializedError()
    }

    log('initializing IPNS keyspace')

    const routing = new OfflineDatastore(repo)
    const ipns = new IPNS(routing, repo.datastore, peerId, keychain, this.options)

    this.offline = ipns
  }

  /**
   * @param {Object} config
   * @param {import('libp2p')} config.libp2p
   * @param {import('ipfs-repo')} config.repo
   * @param {import('peer-id')} config.peerId
   * @param {import('libp2p/src/keychain')} config.keychain
   */
  async startOnline ({ libp2p, repo, peerId, keychain }) {
    if (this.online != null) {
      throw new AlreadyInitializedError()
    }
    const routing = routingConfig({ libp2p, repo, peerId, options: this.options })

    // @ts-ignore routing is a TieredDatastore which wants keys to be Keys, IPNS needs keys to be Uint8Arrays
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
   * @param {PrivateKey} privKey
   * @param {Uint8Array} value
   * @param {number} lifetime
   */
  publish (privKey, value, lifetime) {
    return this.getIPNS().publish(privKey, value, lifetime)
  }

  /**
   *
   * @param {string} name
   * @param {*} [options]
   */
  resolve (name, options) {
    return this.getIPNS().resolve(name, options)
  }

  /**
   * @param {PrivateKey} privKey
   * @param {Uint8Array} value
   */
  initializeKeyspace (privKey, value) {
    return this.getIPNS().initializeKeyspace(privKey, value)
  }
}
module.exports = IPNSAPI
