'use strict'

const { Key } = require('interface-datastore')
const { Record } = require('libp2p-record')
const { Buffer } = require('buffer')
const { encodeBase32 } = require('./utils')

const errcode = require('err-code')
const debug = require('../../debug')
const log = debug('ipfs:ipns:offline-datastore')

/**
 * @typedef {import("ipfs-repo")} Repo
 */

// Offline datastore aims to mimic the same encoding as routing when storing records
// to the local datastore
class OfflineDatastore {
  /**
   * @param {Repo} repo
   */
  constructor (repo) {
    this._repo = repo
  }

  /**
   * Put a value to the local datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value.
   * @param {Buffer} value value to be stored.
   * @returns {Promise<void>}
   */
  async put (key, value) { // eslint-disable-line require-await
    if (!Buffer.isBuffer(key)) {
      throw errcode(new Error('Offline datastore key must be a buffer'), 'ERR_INVALID_KEY')
    }

    if (!Buffer.isBuffer(value)) {
      throw errcode(new Error('Offline datastore value must be a buffer'), 'ERR_INVALID_VALUE')
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
   * @param {Buffer} key identifier of the value to be obtained.
   * @returns {Promise<Buffer>}
   */
  async get (key) {
    if (!Buffer.isBuffer(key)) {
      throw errcode(new Error('Offline datastore key must be a buffer'), 'ERR_INVALID_KEY')
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
      throw (err)
    }

    // @ts-ignore - libp2p-record isn't well typed
    return record.value
  }

  /**
   * encode key properly - base32(/ipns/{cid})
   * @param {Buffer} key
   * @returns {Key}
   */
  _routingKey (key) {
    return new Key('/' + encodeBase32(key), false)
  }
}

exports = module.exports = OfflineDatastore
