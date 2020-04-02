'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const multiaddr = require('multiaddr')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async function findPeer (peerId, options = {}) {
    options.arg = `${Buffer.isBuffer(peerId) ? new CID(peerId) : peerId}`

    const res = await api.ndjson('dht/findpeer', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    for await (const data of res) {
      if (data.Type === 3) {
        throw new Error(data.Extra)
      }

      if (data.Type === 2 && data.Responses) {
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
