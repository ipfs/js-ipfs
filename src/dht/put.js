'use strict'

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const ndjson = require('iterable-ndjson')
const configure = require('../lib/configure')
const toIterable = require('../lib/stream-to-iterable')
const encodeBufferURIComponent = require('../lib/encode-buffer-uri-component')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return (key, value, options) => (async function * () {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.verbose != null) searchParams.set('verbose', options.verbose)

    key = Buffer.isBuffer(key) ? encodeBufferURIComponent(key) : encodeURIComponent(key)
    value = Buffer.isBuffer(value) ? encodeBufferURIComponent(value) : encodeURIComponent(value)

    const url = `dht/put?arg=${key}&arg=${value}&${searchParams}`
    const res = await ky.get(url, {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers
    })

    for await (let message of ndjson(toIterable(res.body))) {
      message = toCamel(message)
      if (message.responses) {
        message.responses = message.responses.map(({ ID, Addrs }) => {
          const peerInfo = new PeerInfo(PeerId.createFromB58String(ID))
          if (Addrs) Addrs.forEach(a => peerInfo.multiaddrs.add(multiaddr(a)))
          return peerInfo
        })
      }
      yield message
    }
  })()
})
