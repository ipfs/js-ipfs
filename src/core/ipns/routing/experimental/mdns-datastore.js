/* eslint-disable no-console */
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
  constructor (options) {
    this.options = options
  }
  /**
   * Put a key value pair into the datastore
   * @param {Buffer} key identifier of the value.
   * @param {Buffer} value value to be stored.
   * @returns {Promise}
   */
  async put (key, value) {
    const start = Date.now()
    if (key.toString().startsWith('/pk/')) {
      return
    }
    if (!Buffer.isBuffer(key)) {
      throw errcode(new Error('MDNS datastore key must be a buffer'), 'ERR_INVALID_KEY')
    }
    if (!Buffer.isBuffer(value)) {
      throw errcode(new Error(`MDNS datastore value must be a buffer`), 'ERR_INVALID_VALUE')
    }

    const keyStr = keyToBase32(key)
    await ky.put(
      'http://ipns.local:8000',
      {
        json: {
          key: keyStr,
          record: value.toString('base64')
        }
      })
    console.log(`
    Local Store
    Domain: ipns.local
    Key: ${keyStr}
    Time: ${(Date.now() - start)}ms
    `)
  }

  /**
   * Get a value from the local datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value to be obtained.
   * @returns {Promise}
   */
  get (key) {
    if (!Buffer.isBuffer(key)) {
      throw errcode(new Error(`MDNS datastore key must be a buffer`), 'ERR_INVALID_KEY')
    }

    return dohBinary('http://ipns.local:8000/dns-query', 'ipns.local', key)
  }
}

module.exports = MDNSDataStore
