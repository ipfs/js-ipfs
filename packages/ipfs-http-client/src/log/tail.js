import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/log').API<HTTPClientExtraOptions>} LogAPI
 */

export const createTail = configure(api => {
  /**
   * @type {LogAPI["tail"]}
   */
  async function * tail (options = {}) {
    const res = await api.post('log/tail', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    yield * res.ndjson()
  }
  return tail
})
