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
  put (key, value, callback) {
    this._pubsubDs.put(key, value, callback)
  }

  /**
   * Get a value from the pubsub datastore indexed by the received key properly encoded.
   * Moreover, the identifier topic is subscribed and the pubsub datastore records will be
   * updated once new publishes occur.
   * @param {Buffer} key identifier of the value to be obtained.
   * @param {function(Error, Buffer)} callback
   * @returns {void}
   */
  get (key, callback) {
    this._pubsubDs.get(key, (err, res) => {
      // Add topic subscribed
      const ns = key.slice(0, ipns.namespaceLength)

      if (ns.toString() === ipns.namespace) {
        const stringifiedTopic = key.toString()
        const id = toB58String(key.slice(ipns.namespaceLength))

        this._subscriptions[stringifiedTopic] = id

        log(`subscribed pubsub ${stringifiedTopic}: ${id}`)
      }

      // If no data was obtained, after storing the subscription, return the error.
      if (err) {
        return callback(err)
      }

      callback(null, res)
    })
  }

  // Modify subscription key to have a proper encoding
  _handleSubscriptionKey (key, callback) {
    const subscriber = this._subscriptions[key]

    if (!subscriber) {
      return callback(errcode(new Error(`key ${key} does not correspond to a subscription`), 'ERR_INVALID_KEY'))
    }

    let keys
    try {
      keys = ipns.getIdKeys(fromB58String(subscriber))
    } catch (err) {
      log.error(err)
      return callback(err)
    }

    callback(null, keys.routingKey.toBuffer())
  }

  /**
   * Get pubsub subscriptions related to ipns.
   * @param {function(Error, Object)} callback
   * @returns {void}
   */
  getSubscriptions (callback) {
    const subscriptions = Object.values(this._subscriptions).filter(Boolean)

    return callback(null, subscriptions.map((sub) => `${ipns.namespace}${sub}`))
  }

  /**
   * Cancel pubsub subscriptions related to ipns.
   * @param {String} name ipns path to cancel the pubsub subscription.
   * @param {function(Error, Object)} callback
   * @returns {void}
   */
  cancel (name, callback) {
    if (typeof name !== 'string') {
      return callback(errcode(new Error('invalid subscription name'), 'ERR_INVALID_SUBSCRIPTION_NAME'))
    }

    // Trim /ipns/ prefix from the name
    if (name.startsWith(ipns.namespace)) {
      name = name.substring(ipns.namespaceLength)
    }

    const stringifiedTopic = Object.keys(this._subscriptions).find((key) => this._subscriptions[key] === name)

    // Not found topic
    if (!stringifiedTopic) {
      return callback(null, {
        canceled: false
      })
    }

    // Unsubscribe topic
    try {
      const bufTopic = Buffer.from(stringifiedTopic)

      this._pubsubDs.unsubscribe(bufTopic)
    } catch (err) {
      return callback(err)
    }

    this._subscriptions[stringifiedTopic] = undefined
    log(`unsubscribed pubsub ${stringifiedTopic}: ${name}`)

    callback(null, {
      canceled: true
    })
  }
}

exports = module.exports = withIs(IpnsPubsubDatastore, { className: 'IpnsPubsubDatastore', symbolName: '@js-ipfs/ipns/IpnsPubsubDatastore' })
