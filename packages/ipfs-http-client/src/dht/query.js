'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async function * query (peerId, options = {}) {
    const res = await api.post('dht/query', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: new CID(peerId),
        ...options
      }),
      headers: options.headers
    })

    for await (let message of res.ndjson()) {
      message = toCamel(message)
      message.id = new CID(message.id)
      message.responses = (message.responses || []).map(({ ID, Addrs }) => ({
        id: ID,
        addrs: (Addrs || []).map(a => multiaddr(a))
      }))
      yield message
    }
  }
})
