'use strict'

const IPNS = require('../ipns')
const routingConfig = require('../ipns/routing/config')
const OfflineDatastore = require('../ipns/routing/offline-datastore')
const { NotInitializedError, AlreadyInitializedError } = require('../errors')
const log = require('debug')('ipfs:components:ipns')

class IPNSAPI {
  /**
   * @param {Object} options
   * @param {string} [options.pass]
   * @param {boolean} [options.offline]
   * @param {LibP2POptions} [options.libp2p]
   * @param {ExperimentalOptions} [options.EXPERIMENTAL]
   */
  constructor (options = {}) {
    this.options = options
    this.offline = null
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
   * @param {import('.').Repo} config.repo
   * @param {import('.').PeerId} config.peerId
   * @param {import('.').Keychain} config.keychain
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
   * @param {import('.').LibP2P} config.libp2p
   * @param {import('.').Repo} config.repo
   * @param {import('.').PeerId} config.peerId
   * @param {import('.').Keychain} config.keychain
   */
  async startOnline ({ libp2p, repo, peerId, keychain }) {
    if (this.online != null) {
      throw new AlreadyInitializedError()
    }
    const routing = routingConfig({ libp2p, repo, peerId, options: this.options })

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

  publish (privKey, value, lifetime) {
    return this.getIPNS().publish(privKey, value, lifetime)
  }

  resolve (name, options) {
    return this.getIPNS().resolve(name, options)
  }

  initializeKeyspace (privKey, value) {
    return this.getIPNS().initializeKeyspace(privKey, value)
  }
}
module.exports = IPNSAPI

/**
 * @typedef {Object} ExperimentalOptions
 * @property {boolean} [ipnsPubsub]
 *
 * @typedef {Object} LibP2POptions
 * @property {DHTConfig} [config]
 *
 * @typedef {Object} DHTConfig
 * @property {boolean} [enabled]
 */
