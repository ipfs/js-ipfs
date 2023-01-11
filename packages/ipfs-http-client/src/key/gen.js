import { objectToCamel } from '../lib/object-to-camel.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/key').API<HTTPClientExtraOptions>} KeyAPI
 */

export const createGen = configure(api => {
  /**
   * @type {KeyAPI["gen"]}
   */
  async function gen (name, options) {
    const opts = options ?? { type: 'Ed25519' }

    const res = await api.post('key/gen', {
      signal: opts.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...opts
      }),
      headers: opts.headers
    })
    const data = await res.json()

    // @ts-expect-error server output is not typed
    return objectToCamel(data)
  }
  return gen
})
