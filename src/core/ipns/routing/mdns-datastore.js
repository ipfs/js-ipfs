'use strict'

const ky = require('ky-universal').default
const errcode = require('err-code')
const debug = require('debug')
const { dohBinary, keyToBase32 } = require('./utils')

const log = debug('ipfs:ipns:mdns-datastore')
log.error = debug('ipfs:ipns:mdns-datastore:error')

// DNS datastore aims to mimic the same encoding as routing when storing records
// to the local datastore
class MDNSDataStore {
  /**
   * Put a value to the local datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value.
   * @param {Buffer} value value to be stored.
   * @param {function(Error)} callback
   * @returns {void}
   */
  put (key, value, callback) {
    if (key.toString().startsWith('/pk/')) {
      return callback()
    }
    if (!Buffer.isBuffer(key)) {
      return callback(errcode(new Error('MDNS datastore key must be a buffer'), 'ERR_INVALID_KEY'))
    }
    if (!Buffer.isBuffer(value)) {
      return callback(errcode(new Error(`MDNS datastore value must be a buffer`), 'ERR_INVALID_VALUE'))
    }

    let keyStr
    try {
      keyStr = keyToBase32(key)
    } catch (err) {
      log.error(err)
      return callback(err)
    }
    ky.put(
      'http://ipns.local:8000',
      {
        json: {
          key: keyStr,
          record: value.toString('base64')
        }
      })
      .then(data => {
        log(`publish key: ${keyStr}`)
        setImmediate(() => callback())
      })
      .catch(err => {
        log.error(err)
        setImmediate(() => callback(err))
      })
  }

  /**
   * Get a value from the local datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value to be obtained.
   * @param {function(Error, Buffer)} callback
   * @returns {void}
   */
  get (key, callback) {
    if (!Buffer.isBuffer(key)) {
      return callback(errcode(new Error(`MDNS datastore key must be a buffer`), 'ERR_INVALID_KEY'))
    }

    dohBinary('http://ipns.local:8000/dns-query', 'ipns.local', key, callback)
  }
}

module.exports = MDNSDataStore
