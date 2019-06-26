/* eslint-disable no-console */
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
      throw errcode(new Error('Workers datastore key must be a buffer'), 'ERR_INVALID_KEY')
    }
    if (!Buffer.isBuffer(value)) {
      throw errcode(new Error(`Workers datastore value must be a buffer`), 'ERR_INVALID_VALUE')
    }

    const keyStr = keyToBase32(key)
    await ky.put(
      'https://workers.ipns.dev',
      {
        json: {
          key: keyStr,
          value: value.toString('base64')
        }
      })

    console.log(`
    Workers Store
    Domain: workers.ipns.dev
    Key: ${keyStr}
    Time: ${(Date.now() - start)}ms
    `)
  }

  /**
   * Get a value from the local datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value to be obtained.
   * @returns {Promise}
   */
  async get (key) {
    const start = Date.now()

    if (!Buffer.isBuffer(key)) {
      throw errcode(new Error(`Workers datastore key must be a buffer`), 'ERR_INVALID_KEY')
    }

    const keyStr = keyToBase32(key)

    const data = await ky
      .get('https://workers.ipns.dev', {
        searchParams: {
          key: keyStr
        }
      })
      .text()

    const record = new Record(key, Buffer.from(data, 'base64'))
    console.log(`Resolved ${keyStr} with workers in: ${(Date.now() - start)}ms`)

    return record.value
  }
}

module.exports = WorkersDataStore
