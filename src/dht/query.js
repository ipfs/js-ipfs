'use strict'

const CID = require('cids')
const ndjson = require('iterable-ndjson')
const multiaddr = require('multiaddr')
const toIterable = require('stream-to-it/source')
const configure = require('../lib/configure')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async function * query (peerId, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${Buffer.isBuffer(peerId) ? new CID(peerId) : peerId}`)
    if (options.verbose != null) searchParams.set('verbose', options.verbose)

    const res = await ky.post('dht/query', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
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
})
