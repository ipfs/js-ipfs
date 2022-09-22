import { multiaddr } from '@multiformats/multiaddr'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { peerIdFromString } from '@libp2p/peer-id'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/swarm').API<HTTPClientExtraOptions>} SwarmAPI
 */

export const createAddrs = configure(api => {
  /**
   * @type {SwarmAPI["addrs"]}
   */
  async function addrs (options = {}) {
    const res = await api.post('swarm/addrs', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    /** @type {{ Addrs: Record<string, string[]> }} */
    const { Addrs } = await res.json()

    return Object.keys(Addrs).map(id => ({
      id: peerIdFromString(id),
      addrs: (Addrs[id] || []).map(a => multiaddr(a))
    }))
  }
  return addrs
})
