'use strict'

const createPublishAPI = require('./publish')
const createResolveAPI = require('./resolve')
const PubSubAPI = require('./pubsub')
class NameAPI {
  /**
   * @param {Object} config
   * @param {IPNS} config.ipns
   * @param {PeerId} config.peerId
   * @param {Options} config.options
   * @param {DagReader} config.dagReader
   * @param {IsOnline} config.isOnline
   * @param {Keychain} config.keychain
   * @param {DNS} config.dns
   */
  constructor ({ dns, ipns, dagReader, peerId, isOnline, keychain, options }) {
    this.publish = createPublishAPI({ ipns, dagReader, peerId, isOnline, keychain })
    this.resolve = createResolveAPI({ dns, ipns, peerId, isOnline, options })
    this.pubsub = new PubSubAPI({ ipns, options: options.EXPERIMENTAL })
  }
}
module.exports = NameAPI

/**
 * @typedef {ResolveOptions & ExperimentalOptions} Options
 *
 * @typedef {Object} ExperimentalOptions
 * @property {PubSubOptions} [EXPERIMENTAL]
 *
 * @typedef {import('./pubsub').Options} PubSubOptions
 * @typedef {import('./resolve').ResolveOptions} ResolveOptions
 *
 * @typedef {import('..').IPNS} IPNS
 * @typedef {import('..').PeerId} PeerId
 * @typedef {import('..').DagReader} DagReader
 * @typedef {import('..').Keychain} Keychain
 * @typedef {import('..').IsOnline} IsOnline
 * @typedef {import('..').DNS} DNS
 * @typedef {import('..').AbortOptions} AbortOptions
 */
