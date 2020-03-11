'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async function * provide (cids, options = {}) {
    cids = Array.isArray(cids) ? cids : [cids]

    const searchParams = new URLSearchParams(options)
    cids.forEach(cid => searchParams.append('arg', `${new CID(cid)}`))

    const res = await api.ndjson('dht/provide', {
      method: 'POST',
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    for await (let message of res) {
      // 3 = QueryError
      // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L18
      // https://github.com/ipfs/go-ipfs/blob/eb11f569b064b960d1aba4b5b8ca155a3bd2cb21/core/commands/dht.go#L283-L284
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
      } else {
        message.responses = []
      }
      yield message
    }
  }
})
