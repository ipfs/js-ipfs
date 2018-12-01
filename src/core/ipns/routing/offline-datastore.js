'use strict'

const { Key } = require('interface-datastore')
const { encodeBase32 } = require('./utils')

const errcode = require('err-code')
const debug = require('debug')
const log = debug('jsipfs:ipns:offline-datastore')
log.error = debug('jsipfs:ipns:offline-datastore:error')

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
      const errMsg = `Offline datastore key must be a buffer`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_KEY'))
    }

    if (!Buffer.isBuffer(value)) {
      const errMsg = `Offline datastore value must be a buffer`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_VALUE'))
    }

    let routingKey

    try {
      routingKey = this._routingKey(key)
    } catch (err) {
      const errMsg = `Not possible to generate the routing key`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_GENERATING_ROUTING_KEY'))
    }

    this._repo.datastore.put(routingKey, value, callback)
  }

  /**
   * Get a value from the local datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value to be obtained.
   * @param {function(Error, Buffer)} callback
   * @returns {void}
   */
  get (key, callback) {
    if (!Buffer.isBuffer(key)) {
      const errMsg = `Offline datastore key must be a buffer`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_KEY'))
    }

    let routingKey

    try {
      routingKey = this._routingKey(key)
    } catch (err) {
      const errMsg = `Not possible to generate the routing key`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_GENERATING_ROUTING_KEY'))
    }

    this._repo.datastore.get(routingKey, callback)
  }

  // encode key properly - base32(/ipns/{cid})
  _routingKey (key) {
    return new Key('/' + encodeBase32(key), false)
  }
}

exports = module.exports = OfflineDatastore
