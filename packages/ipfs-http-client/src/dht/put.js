'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async function * put (key, value, options = {}) {
    const searchParams = new URLSearchParams(options)

    searchParams.append('arg', key)
    searchParams.append('arg', value)
    const res = await api.ndjson('dht/put', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    for await (let message of res) {
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
