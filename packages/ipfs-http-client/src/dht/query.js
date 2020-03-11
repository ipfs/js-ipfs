'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async function * query (peerId, options = {}) {
    options.arg = new CID(peerId)
    const res = await api.ndjson('dht/query', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    for await (let message of res) {
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
