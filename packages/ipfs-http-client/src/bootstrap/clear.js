import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { Multiaddr } from '@multiformats/multiaddr'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/bootstrap').API<HTTPClientExtraOptions>} BootstrapAPI
 */

export const createClear = configure(api => {
  /**
   * @type {BootstrapAPI["clear"]}
   */
  async function clear (options = {}) {
    const res = await api.post('bootstrap/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        all: true
      }),
      headers: options.headers
    })

    const { Peers } = await res.json()

    return { Peers: Peers.map((/** @type {string} */ ma) => new Multiaddr(ma)) }
  }

  return clear
})
