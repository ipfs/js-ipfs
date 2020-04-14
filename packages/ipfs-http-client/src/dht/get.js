'use strict'

const { Buffer } = require('buffer')
const encodeBufferURIComponent = require('../lib/encode-buffer-uri-component')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

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
      })
    })

    for await (const message of res.ndjson()) {
      // 3 = QueryError
      // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L18
      // https://github.com/ipfs/go-ipfs/blob/eb11f569b064b960d1aba4b5b8ca155a3bd2cb21/core/commands/dht.go#L472-L473
      if (message.Type === 3) {
        throw new Error(message.Extra)
      }

      // 5 = Value
      // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L21
      if (message.Type === 5) {
        return message.Extra
      }
    }

    throw new Error('not found')
  }
})
