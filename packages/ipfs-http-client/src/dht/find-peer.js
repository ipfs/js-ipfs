import { Multiaddr } from 'multiaddr'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { FinalPeer } from './response-types.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dht').API<HTTPClientExtraOptions>} DHTAPI
 */

export const createFindPeer = configure(api => {
  /**
   * @type {DHTAPI["findPeer"]}
   */
  async function findPeer (peerId, options = {}) {
    const res = await api.post('dht/findpeer', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: peerId,
        ...options
      }),
      headers: options.headers
    })

    for await (const data of res.ndjson()) {
      if (data.Type === FinalPeer && data.Responses) {
        const { ID, Addrs } = data.Responses[0]
        return {
          id: ID,
          addrs: (Addrs || []).map((/** @type {string} **/ a) => new Multiaddr(a))
        }
      }
    }

    throw new Error('not found')
  }

  return findPeer
})
