'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const { FinalPeer } = require('./response-types')

module.exports = configure(api => {
  /**
   * @type {import('..').ImplementsMethod<'findPeer', import('ipfs-core/src/components/dht')>}
   */
  async function findPeer (peerId, options = {}) {
    const res = await api.post('dht/findpeer', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${peerId instanceof Uint8Array ? new CID(peerId) : peerId}`,
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

  return findPeer
})
