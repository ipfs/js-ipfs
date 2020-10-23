'use strict'

const ipns = require('ipns')
const { toB58String } = require('multihashing-async').multihash
const PubsubDatastore = require('datastore-pubsub')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')

const withIs = require('class-is')

const errcode = require('err-code')
const debug = require('debug')
const log = Object.assign(debug('ipfs:ipns:pubsub'), {
  error: debug('ipfs:ipns:pubsub:error')
})

// Pubsub datastore aims to manage the pubsub subscriptions for IPNS
class IpnsPubsubDatastore {
  constructor (pubsub, localDatastore, peerId) {
    this._pubsub = pubsub
    this._subscriptions = {}

    // Bind _handleSubscriptionKey function, which is called by PubsubDatastore.
    this._handleSubscriptionKey = this._handleSubscriptionKey.bind(this)
    this._pubsubDs = new PubsubDatastore(pubsub, localDatastore, peerId, ipns.validator, this._handleSubscriptionKey)
  }

  /**
   * Put a value to the pubsub datastore indexed by the received key properly encoded.
   *
   * @param {Buffer} key - identifier of the value.
   * @param {Buffer} value - value to be stored.
   * @returns {Promise<void>}
   */
  async put (key, value) { // eslint-disable-line require-await
    return this._pubsubDs.put(key, value)
  }

  /**
   * Get a value from the pubsub datastore indexed by the received key properly encoded.
   * Also, the identifier topic is subscribed to and the pubsub datastore records will be
   * updated once new publishes occur.
   *
   * @param {Buffer} key - identifier of the value to be obtained.
   * @returns {Promise<Buffer>}
   */
  async get (key) {
    let res
    let err

    try {
      res = await this._pubsubDs.get(key)
    } catch (e) {
      err = e
    }

    // Add topic subscribed
    const ns = key.slice(0, ipns.namespaceLength)

    if (uint8ArrayToString(ns) === ipns.namespace) {
      const stringifiedTopic = toB58String(key)
      const id = toB58String(key.slice(ipns.namespaceLength))

      this._subscriptions[stringifiedTopic] = id

      log(`subscribed to pubsub topic ${stringifiedTopic}, id ${id}`)
    }

    // If no data was obtained, after storing the subscription, return the error.
    if (err) {
      throw err
    }

    return res
  }

  // Modify subscription key to have a proper encoding
  _handleSubscriptionKey (key) {
    if (key instanceof Uint8Array) {
      key = uint8ArrayToString(key, 'base58btc')
    }

    const subscriber = this._subscriptions[key]

    if (!subscriber) {
      throw errcode(new Error(`key ${key} does not correspond to a subscription`), 'ERR_INVALID_KEY')
    }

    let keys
    try {
      keys = ipns.getIdKeys(uint8ArrayFromString(subscriber, 'base58btc'))
    } catch (err) {
      log.error(err)
      throw err
    }

    return keys.routingKey.uint8Array()
  }

  /**
   * Get pubsub subscriptions related to ipns.
   *
   * @returns {string[]}
   */
  getSubscriptions () {
    const subscriptions = Object.values(this._subscriptions).filter(Boolean)

    return subscriptions.map((sub) => `${ipns.namespace}${sub}`)
  }

  /**
   * Cancel pubsub subscriptions related to ipns.
   *
   * @param {string} name - ipns path to cancel the pubsub subscription.
   * @returns {Promise<{canceled: boolean}>}
   */
  async cancel (name) { // eslint-disable-line require-await
    if (typeof name !== 'string') {
      throw errcode(new Error('invalid subscription name'), 'ERR_INVALID_SUBSCRIPTION_NAME')
    }

    // Trim /ipns/ prefix from the name
    if (name.startsWith(ipns.namespace)) {
      name = name.substring(ipns.namespaceLength)
    }

    const stringifiedTopic = Object.keys(this._subscriptions).find((key) => this._subscriptions[key] === name)

    // Not found topic
    if (!stringifiedTopic) {
      return {
        canceled: false
      }
    }

    // Unsubscribe topic
    const bufTopic = uint8ArrayFromString(stringifiedTopic)

    this._pubsubDs.unsubscribe(bufTopic)

    this._subscriptions[stringifiedTopic] = undefined
    log(`unsubscribed pubsub ${stringifiedTopic}: ${name}`)

    return {
      canceled: true
    }
  }
}

exports = module.exports = withIs(IpnsPubsubDatastore, { className: 'IpnsPubsubDatastore', symbolName: '@js-ipfs/ipns/IpnsPubsubDatastore' })
