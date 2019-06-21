'use strict'

const ky = require('ky-universal').default
const errcode = require('err-code')
const debug = require('debug')
const { Record } = require('libp2p-record')
const { keyToBase32 } = require('./utils')

const log = debug('ipfs:ipns:workers-datastore')
log.error = debug('ipfs:ipns:workers-datastore:error')

// Workers datastore aims to mimic the same encoding as routing when storing records
// to the local datastore
class WorkersDataStore {
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
      return callback(errcode(new Error('Workers datastore key must be a buffer'), 'ERR_INVALID_KEY'))
    }
    if (!Buffer.isBuffer(value)) {
      return callback(errcode(new Error(`Workers datastore value must be a buffer`), 'ERR_INVALID_VALUE'))
    }

    let keyStr
    try {
      keyStr = keyToBase32(key)
    } catch (err) {
      log.error(err)
      return callback(err)
    }
    ky.put(
      'https://workers.ipns.dev',
      {
        json: {
          key: keyStr,
          value: value.toString('base64')
        }
      })
      .text()
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
    const start = Date.now()

    if (!Buffer.isBuffer(key)) {
      return callback(errcode(new Error(`Workers datastore key must be a buffer`), 'ERR_INVALID_KEY'))
    }

    let keyStr
    try {
      keyStr = keyToBase32(key)
    } catch (err) {
      log.error(err)
      return callback(err)
    }

    ky
      .get('https://workers.ipns.dev', {
        searchParams: {
          key: keyStr
        }
      })
      .text()
      .then(data => {
        const record = new Record(key, Buffer.from(data, 'base64'))
        log(`resolved: ${keyStr}`)
        log(`time: ${(Date.now() - start)}ms`)

        setImmediate(() => callback(null, record.value))
      })
      .catch(err => {
        log.error(err)
        setImmediate(() => callback(err))
      })
  }
}

module.exports = WorkersDataStore
