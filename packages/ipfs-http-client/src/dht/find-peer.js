'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const multiaddr = require('multiaddr')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const { FinalPeer } = require('./response-types')

module.exports = configure(api => {
  return async function findPeer (peerId, options = {}) {
    const res = await api.post('dht/findpeer', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${Buffer.isBuffer(peerId) ? new CID(peerId) : peerId}`,
        ...options
      }),
      headers: options.headers
    })

    for await (const data of res.ndjson()) {
      if (data.Type === FinalPeer && data.Responses) {
        const { ID, Addrs } = data.Responses[0]
        return {
          id: ID,
          addrs: (Addrs || []).map(a => multiaddr(a))
        }
      }
    }

    throw new Error('not found')
  }
})
