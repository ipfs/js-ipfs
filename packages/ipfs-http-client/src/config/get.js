import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/config').API<HTTPClientExtraOptions>} ConfigAPI
 */

export const createGet = configure(api => {
  /**
   * @type {ConfigAPI["get"]}
   */
  const get = async (key, options = {}) => {
    if (!key) {
      throw new Error('key argument is required')
    }

    const res = await api.post('config', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: key,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return data.Value
  }

  return get
})
