'use strict'

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const ndjson = require('iterable-ndjson')
const configure = require('../lib/configure')
const toIterable = require('../lib/stream-to-iterable')

module.exports = configure(({ ky }) => {
  return async function * query (peerId, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${peerId}`)
    if (options.verbose != null) searchParams.set('verbose', options.verbose)

    const res = await ky.post('dht/query', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const message of ndjson(toIterable(res.body))) {
      yield new PeerInfo(PeerId.createFromB58String(message.ID))
    }
  }
})
