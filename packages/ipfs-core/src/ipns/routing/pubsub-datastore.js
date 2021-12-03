import * as ipns from 'ipns'
import { base58btc } from 'multiformats/bases/base58'
import { PubsubDatastore } from 'datastore-pubsub'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import errcode from 'err-code'
import debug from 'debug'

const log = Object.assign(debug('ipfs:ipns:pubsub'), {
  error: debug('ipfs:ipns:pubsub:error')
})

// Pubsub datastore aims to manage the pubsub subscriptions for IPNS
export class IpnsPubsubDatastore {
  /**
   * @param {import('libp2p-interfaces/src/pubsub')} pubsub
   * @param {import('interface-datastore').Datastore} localDatastore
   * @param {import('peer-id')} peerId
   */
  constructor (pubsub, localDatastore, peerId) {
    /** @type {Record<string, string>} */
    this._subscriptions = {}

    // Bind _handleSubscriptionKey function, which is called by PubsubDatastore.
    this._handleSubscriptionKey = this._handleSubscriptionKey.bind(this)

    // @ts-ignore will be fixed by https://github.com/ipfs/js-datastore-pubsub/pull/74
    this._pubsubDs = new PubsubDatastore(pubsub, localDatastore, peerId, ipns.validator, this._handleSubscriptionKey)
  }

  /**
   * Put a value to the pubsub datastore indexed by the received key properly encoded.
   *
   * @param {Uint8Array} key - identifier of the value.
   * @param {Uint8Array} value - value to be stored.
   */
  async put (key, value) {
    try {
      // @ts-ignore datastores take Key keys, this one takes Uint8Array keys
      await this._pubsubDs.put(key, value)
    } catch (/** @type {any} */ err) {
      log.error(err)
      throw err
    }
  }

  /**
   * Get a value from the pubsub datastore indexed by the received key properly encoded.
   * Also, the identifier topic is subscribed to and the pubsub datastore records will be
   * updated once new publishes occur.
   *
   * @param {Uint8Array} key - identifier of the value to be obtained.
   */
  async get (key) {
    let res
    let err

    try {
      // @ts-ignore datastores take Key keys, this one takes Uint8Array keys
      res = await this._pubsubDs.get(key)
    } catch (/** @type {any} */ e) {
      err = e
    }

    // Add topic subscribed
    const ns = key.slice(0, ipns.namespaceLength)

    if (uint8ArrayToString(ns) === ipns.namespace) {
      const stringifiedTopic = base58btc.encode(key).substring(1)
      const id = base58btc.encode(key.slice(ipns.namespaceLength)).substring(1)

      this._subscriptions[stringifiedTopic] = id

      log(`subscribed to pubsub topic ${stringifiedTopic}, id ${id}`)
    }

    // If no data was obtained, after storing the subscription, return the error.
    if (err) {
      throw err
    }

    return res
  }

  /**
   * Modify subscription key to have a proper encoding
   *
   * @param {Uint8Array | string} key
   */
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
    } catch (/** @type {any} */ err) {
      log.error(err)
      throw err
    }

    return keys.routingKey.uint8Array()
  }

  /**
   * Get pubsub subscriptions related to ipns.
   */
  getSubscriptions () {
    const subscriptions = Object.values(this._subscriptions).filter(Boolean)

    return subscriptions.map((sub) => `${ipns.namespace}${sub}`)
  }

  /**
   * Cancel pubsub subscriptions related to ipns.
   *
   * @param {string} name - ipns path to cancel the pubsub subscription.
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

    delete this._subscriptions[stringifiedTopic]
    log(`unsubscribed pubsub ${stringifiedTopic}: ${name}`)

    return {
      canceled: true
    }
  }
}
