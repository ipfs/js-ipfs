import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { multiaddr } from '@multiformats/multiaddr'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/bootstrap').API<HTTPClientExtraOptions>} BootstrapAPI
 */

export const createAdd = configure(api => {
  /**
   * @type {BootstrapAPI["add"]}
   */
  async function add (addr, options = {}) {
    const res = await api.post('bootstrap/add', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options.headers
    })

    const { Peers } = await res.json()

    return { Peers: Peers.map((/** @type {string} */ ma) => multiaddr(ma)) }
  }

  return add
})
