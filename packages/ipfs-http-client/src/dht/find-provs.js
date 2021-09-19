

import { Multiaddr } from 'multiaddr'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
const { Provider } = require('./response-types')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dht').API<HTTPClientExtraOptions>} DHTAPI
 */

 export const createFindProvs = configure(api => {
  /**
   * @type {DHTAPI["findProvs"]}
   */
  async function * findProvs (cid, options = {}) {
    const res = await api.post('dht/findprovs', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    })

    for await (const message of res.ndjson()) {
      if (message.Type === Provider && message.Responses) {
        for (const { ID, Addrs } of message.Responses) {
          yield {
            id: ID,
            addrs: (Addrs || []).map((/** @type {string} **/ a) => new Multiaddr(a))
          }
        }
      }
    }
  }

  return findProvs
})
