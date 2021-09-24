import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/name').API<HTTPClientExtraOptions>} NameAPI
 */

export const createResolve = configure(api => {
  /**
   * @type {NameAPI["resolve"]}
   */
  async function * resolve (path, options = {}) {
    const res = await api.post('name/resolve', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        stream: true,
        ...options
      }),
      headers: options.headers
    })

    for await (const result of res.ndjson()) {
      yield result.Path
    }
  }
  return resolve
})
