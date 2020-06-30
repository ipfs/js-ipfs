'use strict'

const { Buffer } = require('buffer')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const { Value } = require('./response-types')

module.exports = configure(api => {
  return async function get (key, options = {}) {
    const res = await api.post('dht/get', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: Buffer.isBuffer(key) ? key.toString() : key,
        ...options
      }),
      headers: options.headers
    })

    for await (const message of res.ndjson()) {
      if (message.Type === Value) {
        return Buffer.from(message.Extra, 'base64')
      }
    }

    throw new Error('not found')
  }
})
