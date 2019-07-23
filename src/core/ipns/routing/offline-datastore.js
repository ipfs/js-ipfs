'use strict'

const { Key } = require('interface-datastore')
const { Record } = require('libp2p-record')
const { encodeBase32 } = require('./utils')

const errcode = require('err-code')
const debug = require('debug')
const log = debug('ipfs:ipns:offline-datastore')
log.error = debug('ipfs:ipns:offline-datastore:error')

// Offline datastore aims to mimic the same encoding as routing when storing records
// to the local datastore
class OfflineDatastore {
  constructor (repo) {
    this._repo = repo
  }

  /**
   * Put a value to the local datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value.
   * @param {Buffer} value value to be stored.
   * @param {function(Error)} callback
   * @returns {void}
   */
  put (key, value, callback) {
    if (!Buffer.isBuffer(key)) {
      return callback(errcode(new Error('Offline datastore key must be a buffer'), 'ERR_INVALID_KEY'))
    }

    if (!Buffer.isBuffer(value)) {
      return callback(errcode(new Error('Offline datastore value must be a buffer'), 'ERR_INVALID_VALUE'))
    }

    let routingKey

    try {
      routingKey = this._routingKey(key)
    } catch (err) {
      log.error(err)
      return callback(errcode(new Error('Not possible to generate the routing key'), 'ERR_GENERATING_ROUTING_KEY'))
    }

    // Marshal to libp2p record as the DHT does
    const record = new Record(key, value)

    this._repo.datastore.put(routingKey, record.serialize(), callback)
  }

  /**
   * Get a value from the local datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value to be obtained.
   * @param {function(Error, Buffer)} callback
   * @returns {void}
   */
  get (key, callback) {
    if (!Buffer.isBuffer(key)) {
      return callback(errcode(new Error('Offline datastore key must be a buffer'), 'ERR_INVALID_KEY'))
    }

    let routingKey

    try {
      routingKey = this._routingKey(key)
    } catch (err) {
      log.error(err)
      return callback(errcode(new Error('Not possible to generate the routing key'), 'ERR_GENERATING_ROUTING_KEY'))
    }

    this._repo.datastore.get(routingKey, (err, res) => {
      if (err) {
        return callback(err)
      }

      // Unmarshal libp2p record as the DHT does
      let record
      try {
        record = Record.deserialize(res)
      } catch (err) {
        log.error(err)
        return callback(err)
      }

      callback(null, record.value)
    })
  }

  // encode key properly - base32(/ipns/{cid})
  _routingKey (key) {
    return new Key('/' + encodeBase32(key), false)
  }
}

exports = module.exports = OfflineDatastore
