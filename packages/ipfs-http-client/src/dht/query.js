'use strict'

const CID = require('cids')
const ndjson = require('iterable-ndjson')
const multiaddr = require('multiaddr')
const toIterable = require('stream-to-it/source')
const toCamel = require('../lib/object-to-camel')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async function * query (peerId, options = {}) {
    options.arg = new CID(peerId)
    const res = await api.post('dht/query', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    for await (let message of ndjson(toIterable(res.body))) {
      message = toCamel(message)
      message.id = new CID(message.id)
      message.responses = (message.responses || []).map(({ ID, Addrs }) => ({
        id: ID,
        addrs: (Addrs || []).map(a => multiaddr(a))
      }))
      yield message
    }
  }
}
