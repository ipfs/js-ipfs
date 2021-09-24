import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/bitswap').API<HTTPClientExtraOptions>} BitswapAPI
 */

export const createUnwant = configure(api => {
  /**
   * @type {BitswapAPI["unwant"]}
   */
  async function unwant (cid, options = {}) {
    const res = await api.post('bitswap/unwant', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    })

    return res.json()
  }
  return unwant
})
