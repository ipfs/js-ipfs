'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const multiaddr = require('multiaddr')
const ndjson = require('iterable-ndjson')
const configure = require('../lib/configure')
const toIterable = require('stream-to-it/source')
const encodeBufferURIComponent = require('../lib/encode-buffer-uri-component')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async function * put (key, value, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.verbose != null) searchParams.set('verbose', options.verbose)

    key = Buffer.isBuffer(key) ? encodeBufferURIComponent(key) : encodeURIComponent(key)
    value = Buffer.isBuffer(value) ? encodeBufferURIComponent(value) : encodeURIComponent(value)

    const url = `dht/put?arg=${key}&arg=${value}&${searchParams}`
    const res = await ky.post(url, {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers
    })

    for await (let message of ndjson(toIterable(res.body))) {
      // 3 = QueryError
      // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L18
      // https://github.com/ipfs/go-ipfs/blob/eb11f569b064b960d1aba4b5b8ca155a3bd2cb21/core/commands/dht.go#L472-L473
      if (message.Type === 3) {
        throw new Error(message.Extra)
      }

      message = toCamel(message)
      message.id = new CID(message.id)
      if (message.responses) {
        message.responses = message.responses.map(({ ID, Addrs }) => ({
          id: ID,
          addrs: (Addrs || []).map(a => multiaddr(a))
        }))
      }
      yield message
    }
  }
})
