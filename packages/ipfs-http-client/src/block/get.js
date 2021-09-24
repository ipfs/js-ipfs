import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/block').API<HTTPClientExtraOptions>} BlockAPI
 */

export const createGet = configure(api => {
  /**
   * @type {BlockAPI["get"]}
   */
  async function get (cid, options = {}) {
    const res = await api.post('block/get', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    })

    return new Uint8Array(await res.arrayBuffer())
  }
  return get
})
