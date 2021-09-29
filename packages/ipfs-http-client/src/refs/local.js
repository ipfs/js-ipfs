import { objectToCamel } from '../lib/object-to-camel.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/refs').API<HTTPClientExtraOptions>} RefsAPI
 */

export const createLocal = configure(api => {
  /**
   * @type {RefsAPI["local"]}
   */
  async function * refsLocal (options = {}) {
    const res = await api.post('refs/local', {
      signal: options.signal,
      transform: objectToCamel,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    yield * res.ndjson()
  }
  return refsLocal
})
