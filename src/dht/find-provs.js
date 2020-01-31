'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const ndjson = require('iterable-ndjson')
const configure = require('../lib/configure')
const toIterable = require('stream-to-it/source')

module.exports = configure(({ ky }) => {
  return async function * findProvs (cid, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${new CID(cid)}`)
    if (options.numProviders) searchParams.set('num-providers', options.numProviders)
    if (options.verbose != null) searchParams.set('verbose', options.verbose)

    const res = await ky.post('dht/findprovs', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const message of ndjson(toIterable(res.body))) {
      // 3 = QueryError
      // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L18
      // https://github.com/libp2p/go-libp2p-kad-dht/blob/master/routing.go#L525-L526
      if (message.Type === 3) {
        throw new Error(message.Extra)
      }

      // 4 = Provider
      // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L20
      if (message.Type === 4 && message.Responses) {
        for (const { ID, Addrs } of message.Responses) {
          yield {
            id: ID,
            addrs: (Addrs || []).map(a => multiaddr(a))
          }
        }
      }
    }
  }
})
