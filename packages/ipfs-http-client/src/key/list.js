import { objectToCamel } from '../lib/object-to-camel.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/key').API<HTTPClientExtraOptions>} KeyAPI
 */

export const createList = configure(api => {
  /**
   * @type {KeyAPI["list"]}
   */
  async function list (options = {}) {
    const res = await api.post('key/list', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    const data = await res.json()

    return (data.Keys || []).map((/** @type {any} **/ k) => objectToCamel(k))
  }
  return list
})
