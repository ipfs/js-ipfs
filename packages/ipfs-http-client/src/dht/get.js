'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const { Value } = require('./response-types')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')

module.exports = configure(api => {
  /**
   * @type {import('..').ImplementsMethod<'get', import('ipfs-core/src/components/dht')>}
   */
  async function get (key, options = {}) {
    const res = await api.post('dht/get', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: key instanceof Uint8Array ? uint8ArrayToString(key) : key,
        ...options
      }),
      headers: options.headers
    })

    for await (const message of res.ndjson()) {
      if (message.Type === Value) {
        return uint8ArrayFromString(message.Extra, 'base64pad')
      }
    }

    throw new Error('not found')
  }

  return get
})
