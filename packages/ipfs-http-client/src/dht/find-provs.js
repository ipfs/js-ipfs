'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async function * findProvs (cid, options = {}) {
    const res = await api.post('dht/findprovs', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${new CID(cid)}`,
        ...options
      })
    })

    for await (const message of res.ndjson()) {
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
