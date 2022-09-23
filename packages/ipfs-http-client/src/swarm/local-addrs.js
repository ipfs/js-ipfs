import { multiaddr } from '@multiformats/multiaddr'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/swarm').API<HTTPClientExtraOptions>} SwarmAPI
 */

export const createLocalAddrs = configure(api => {
  /**
   * @type {SwarmAPI["localAddrs"]}
   */
  async function localAddrs (options = {}) {
    const res = await api.post('swarm/addrs/local', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    /** @type {{ Strings: string[] }} */
    const { Strings } = await res.json()

    return (Strings || []).map(a => multiaddr(a))
  }
  return localAddrs
})
