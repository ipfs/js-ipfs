import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { multiaddr } from '@multiformats/multiaddr'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/bootstrap').API<HTTPClientExtraOptions>} BootstrapAPI
 */

export const createList = configure(api => {
  /**
   * @type {BootstrapAPI["list"]}
   */
  async function list (options = {}) {
    const res = await api.post('bootstrap/list', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    const { Peers } = await res.json()

    return { Peers: Peers.map((/** @type {string} */ ma) => multiaddr(ma)) }
  }

  return list
})
