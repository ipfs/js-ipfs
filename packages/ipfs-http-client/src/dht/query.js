
import { Multiaddr } from 'multiaddr'
import { objectToCamel } from '../lib/object-to-camel'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dht').API<HTTPClientExtraOptions>} DHTAPI
 */

 export const createQuery = configure(api => {
  /**
   * @type {DHTAPI["query"]}
   */
  async function * query (peerId, options = {}) {
    const res = await api.post('dht/query', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: peerId.toString(),
        ...options
      }),
      headers: options.headers
    })

    for await (let message of res.ndjson()) {
      message = toCamel(message)
      message.responses = (message.responses || []).map((/** @type {{ ID: string, Addrs: string[] }} */ { ID, Addrs }) => ({
        id: ID,
        addrs: (Addrs || []).map((/** @type {string} **/ a) => new Multiaddr(a))
      }))
      yield message
    }
  }

  return query
})
