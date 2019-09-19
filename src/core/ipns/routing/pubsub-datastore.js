'use strict'

const ipns = require('ipns')
const { fromB58String, toB58String } = require('multihashes')
const PubsubDatastore = require('datastore-pubsub')

const withIs = require('class-is')

const errcode = require('err-code')
const debug = require('debug')
const log = debug('ipfs:ipns:pubsub')
log.error = debug('ipfs:ipns:pubsub:error')

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
   * @param {Buffer} key identifier of the value.
   * @param {Buffer} value value to be stored.
   * @param {function(Error)} callback
   * @returns {void}
   */
  async put (key, value) { // eslint-disable-line require-await
    return this._pubsubDs.put(key, value)
  }

  /**
   * Get a value from the pubsub datastore indexed by the received key properly encoded.
   * Also, the identifier topic is subscribed to and the pubsub datastore records will be
   * updated once new publishes occur.
   * @param {Buffer} key identifier of the value to be obtained.
   * @param {function(Error, Buffer)} callback
   * @returns {void}
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

    if (ns.toString() === ipns.namespace) {
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
    if (Buffer.isBuffer(key)) {
      key = toB58String(key)
    }

    const subscriber = this._subscriptions[key]

    if (!subscriber) {
      throw errcode(new Error(`key ${key} does not correspond to a subscription`), 'ERR_INVALID_KEY')
    }

    let keys
    try {
      keys = ipns.getIdKeys(fromB58String(subscriber))
    } catch (err) {
      log.error(err)
      throw err
    }

    return keys.routingKey.toBuffer()
  }

  /**
   * Get pubsub subscriptions related to ipns.
   * @param {function(Error, Object)} callback
   * @returns {Array<Object>}
   */
  getSubscriptions () {
    const subscriptions = Object.values(this._subscriptions).filter(Boolean)

    return subscriptions.map((sub) => `${ipns.namespace}${sub}`)
  }

  /**
   * Cancel pubsub subscriptions related to ipns.
   * @param {String} name ipns path to cancel the pubsub subscription.
   * @param {function(Error, Object)} callback
   * @returns {void}
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
    const bufTopic = Buffer.from(stringifiedTopic)

    this._pubsubDs.unsubscribe(bufTopic)

    this._subscriptions[stringifiedTopic] = undefined
    log(`unsubscribed pubsub ${stringifiedTopic}: ${name}`)

    return {
      canceled: true
    }
  }
}

exports = module.exports = withIs(IpnsPubsubDatastore, { className: 'IpnsPubsubDatastore', symbolName: '@js-ipfs/ipns/IpnsPubsubDatastore' })
