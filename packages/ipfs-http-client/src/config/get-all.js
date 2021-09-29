import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/config').API<HTTPClientExtraOptions>} ConfigAPI
 */

export const createGetAll = configure(api => {
  /**
   * @type {ConfigAPI["getAll"]}
   */
  const getAll = async (options = {}) => {
    const res = await api.post('config/show', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return data
  }

  return getAll
})
