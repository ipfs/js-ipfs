'use strict'

const ipns = require('ipns')
const { fromB58String, toB58String } = require('multihashes')
const PeerId = require('peer-id')
const DatastorePubsub = require('datastore-pubsub')

const errcode = require('err-code')
const debug = require('debug')
const log = debug('jsipfs:ipns:pubsub')
log.error = debug('jsipfs:ipns:pubsub:error')

const ipnsNS = '/ipns/'
const ipnsNSLength = ipnsNS.length

// Pubsub aims to manage the pubsub subscriptions for IPNS
class Pubsub {
  constructor (node) {
    const pubsub = node._libp2pNode.pubsub
    const localDatastore = node._repo.datastore
    const peerId = node._peerInfo.id
    this._pubsub = pubsub

    this._subscriptions = {}

    // Bind _handleSubscriptionKey function, which is called by datastorePubsub.
    this._handleSubscriptionKey = this._handleSubscriptionKey.bind(this)
    this._dsPubsub = new DatastorePubsub(pubsub, localDatastore, peerId, ipns.validator, this._handleSubscriptionKey)
  }

  /**
   * Put a value to the pubsub datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value.
   * @param {Buffer} value value to be stored.
   * @param {function(Error)} callback
   * @returns {void}
   */
  put (key, value, callback) {
    if (!Buffer.isBuffer(key)) {
      const errMsg = `key does not have a valid format`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_KEY'))
    }

    if (!Buffer.isBuffer(value)) {
      const errMsg = `received value is not a buffer`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_VALUE_RECEIVED'))
    }

    this._dsPubsub.put(key, value, callback)
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
    if (!Buffer.isBuffer(key)) {
      const errMsg = `key does not have a valid format`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_KEY'))
    }

    this._dsPubsub.get(key, (err, res) => {
      // Add topic subscribed
      const ns = key.slice(0, ipnsNSLength)

      if (ns.toString() === ipnsNS) {
        const stringifiedTopic = key.toString()
        const id = toB58String(key.slice(ipnsNSLength))

        this._subscriptions[stringifiedTopic] = id

        log(`subscribed pubsub ${stringifiedTopic}: ${id}`)
      }

      if (err) {
        return callback(err)
      }

      callback(null, res)
    })
  }

  // Modify subscription key to have a proper encoding
  // Without this, the utf-8 encoding gets the key broken
  _handleSubscriptionKey (key, callback) {
    const subscriber = this._subscriptions[key]

    if (!subscriber) {
      const errMsg = `key ${key} does not correspond to a subscription`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_KEY'))
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
    this._pubsub.ls((err, res) => {
      if (err || !res) {
        log.error(err)
        return callback(err)
      }

      // Iterate over subscriptions
      const strings = []
      res.forEach((subs) => {
        const ns = subs.substring(0, ipnsNSLength)
        const subscription = this._subscriptions[subs]

        if (ns === ipnsNS && subscription) {
          // Verify valid PeerID
          try {
            PeerId.createFromBytes(Buffer.from(subscription))
            // add to the list
            strings.push(`/ipns/${subscription}`)
          } catch (err) {
            log.error('ipns key not a valid peer ID')
          }
        }
      })

      callback(null, {
        strings
      })
    })
  }

  /**
   * Get pubsub subscriptions related to ipns.
   * @param {String} name ipns path to cancel the pubsub subscription.
   * @param {function(Error, Object)} callback
   * @returns {void}
   */
  cancel (name, callback) {
    if (typeof name !== 'string') {
      const errMsg = `received subscription name is not valid`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_SUBSCRIPTION_NAME'))
    }

    // Trim /ipns/ prefix from the name
    if (name.startsWith(ipnsNS)) {
      name = name.substring(ipnsNSLength)
    }

    // Verify peerId validity
    try {
      PeerId.createFromBytes(Buffer.from(name))
    } catch (err) {
      const errMsg = `ipns key is not a valid peer ID`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_IPNS_KEY'))
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

      this._dsPubsub.unsubscribe(bufTopic)
    } catch (err) {
      return callback(err)
    }

    delete this._subscriptions[stringifiedTopic]
    log(`unsubscribed pubsub ${stringifiedTopic}: ${name}`)

    callback(null, {
      canceled: true
    })
  }
}

exports = module.exports = Pubsub
