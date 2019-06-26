/* eslint-disable no-console */
'use strict'

const ky = require('ky-universal').default
const errcode = require('err-code')
const debug = require('debug')
const { dohBinary, keyToBase32 } = require('./utils')

const log = debug('ipfs:ipns:dns-datastore')
log.error = debug('ipfs:ipns:dns-datastore:error')

class DNSDataStore {
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
      throw errcode(new Error('DNS datastore key must be a buffer'), 'ERR_INVALID_KEY')
    }
    if (!Buffer.isBuffer(value)) {
      throw errcode(new Error(`DNS datastore value must be a buffer`), 'ERR_INVALID_VALUE')
    }

    const keyStr = keyToBase32(key)
    const data = await ky
      .put(
        'https://ipns.dev',
        {
          json: {
            key: keyStr,
            record: value.toString('base64'),
            subdomain: true,
            alias: this.options.alias
          }
        }
      )
      .json()

    console.log(`
    DNS Store
    Domain: ipns.dev
    Key: ${keyStr}
    Subdomain: ${data.subdomain}
    Alias: ${data.alias}
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
      throw errcode(new Error(`DNS datastore key must be a buffer`), 'ERR_INVALID_KEY')
    }
    // https://dns.google.com/experimental
    // https://cloudflare-dns.com/dns-query
    // https://mozilla.cloudflare-dns.com/dns-query
    return dohBinary('https://cloudflare-dns.com/dns-query', 'dns.ipns.dev', key)
  }
}

module.exports = DNSDataStore
