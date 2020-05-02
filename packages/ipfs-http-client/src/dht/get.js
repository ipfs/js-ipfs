'use strict'

const { Buffer } = require('buffer')
const encodeBufferURIComponent = require('../lib/encode-buffer-uri-component')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const { Value } = require('./response-types')

module.exports = configure(api => {
  return async function get (key, options = {}) {
    if (!Buffer.isBuffer(key)) {
      throw new Error('invalid key')
    }

    const res = await api.post('dht/get', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        key: encodeBufferURIComponent(key),
        ...options
      }),
      headers: options.headers
    })

    for await (const message of res.ndjson()) {
      if (message.Type === Value) {
        return message.Extra
      }
    }

    throw new Error('not found')
  }
})
