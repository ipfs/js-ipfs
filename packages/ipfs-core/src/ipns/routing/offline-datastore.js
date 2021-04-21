'use strict'

const { Key } = require('interface-datastore')
const { Record } = require('libp2p-record')
const { encodeBase32 } = require('./utils')

const errcode = require('err-code')
const debug = require('debug')
const log = Object.assign(debug('ipfs:ipns:offline-datastore'), {
  error: debug('ipfs:ipns:offline-datastore:error')
})

// Offline datastore aims to mimic the same encoding as routing when storing records
// to the local datastore
class OfflineDatastore {
  /**
   * @param {import('ipfs-repo')} repo
   */
  constructor (repo) {
    this._repo = repo
    /** @type {any[]} */
    this.stores = []
  }

  /**
   * Put a value to the local datastore indexed by the received key properly encoded.
   *
   * @param {Uint8Array} key - identifier of the value.
   * @param {Uint8Array} value - value to be stored.
   */
  async put (key, value) { // eslint-disable-line require-await
    if (!(key instanceof Uint8Array)) {
      throw errcode(new Error('Offline datastore key must be a Uint8Array'), 'ERR_INVALID_KEY')
    }

    if (!(value instanceof Uint8Array)) {
      throw errcode(new Error('Offline datastore value must be a Uint8Array'), 'ERR_INVALID_VALUE')
    }

    let routingKey

    try {
      routingKey = this._routingKey(key)
    } catch (err) {
      log.error(err)
      throw errcode(new Error('Not possible to generate the routing key'), 'ERR_GENERATING_ROUTING_KEY')
    }

    // Marshal to libp2p record as the DHT does
    const record = new Record(key, value)

    return this._repo.datastore.put(routingKey, record.serialize())
  }

  /**
   * Get a value from the local datastore indexed by the received key properly encoded.
   *
   * @param {Uint8Array} key - identifier of the value to be obtained.
   */
  async get (key) {
    if (!(key instanceof Uint8Array)) {
      throw errcode(new Error('Offline datastore key must be a Uint8Array'), 'ERR_INVALID_KEY')
    }

    let routingKey

    try {
      routingKey = this._routingKey(key)
    } catch (err) {
      log.error(err)
      throw errcode(new Error('Not possible to generate the routing key'), 'ERR_GENERATING_ROUTING_KEY')
    }

    const res = await this._repo.datastore.get(routingKey)

    // Unmarshal libp2p record as the DHT does
    let record
    try {
      record = Record.deserialize(res)
    } catch (err) {
      log.error(err)
      throw err
    }

    return record.value
  }

  /**
   * encode key properly - base32(/ipns/{cid})
   *
   * @param {Uint8Array} key
   */
  _routingKey (key) {
    return new Key('/' + encodeBase32(key), false)
  }
}

exports = module.exports = OfflineDatastore
