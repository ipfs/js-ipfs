

import { objectToCamel } from '../lib/object-to-camel'
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
  async function gen (name, options = { type: 'rsa', size: 2048 }) {
    const res = await api.post('key/gen', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    // @ts-ignore server output is not typed
    return toCamel(data)
  }
  return gen
})
