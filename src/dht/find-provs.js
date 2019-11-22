'use strict'

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const multiaddr = require('multiaddr')
const ndjson = require('iterable-ndjson')
const configure = require('../lib/configure')
const toIterable = require('../lib/stream-to-iterable')

module.exports = configure(({ ky }) => {
  return async function * findProvs (cid, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${cid}`)
    if (options.numProviders) searchParams.set('num-providers', options.numProviders)
    if (options.verbose != null) searchParams.set('verbose', options.verbose)

    const res = await ky.post('dht/findprovs', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const message of ndjson(toIterable(res.body))) {
      // 4 = Provider
      // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L20
      if (message.Type === 4 && message.Responses) {
        for (const { ID, Addrs } of message.Responses) {
          const peerInfo = new PeerInfo(PeerId.createFromB58String(ID))
          if (Addrs) Addrs.forEach(a => peerInfo.multiaddrs.add(multiaddr(a)))
          yield peerInfo
        }
      }
    }
  }
})
