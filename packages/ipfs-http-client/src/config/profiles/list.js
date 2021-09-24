import { objectToCamel } from '../../lib/object-to-camel.js'
import { configure } from '../../lib/configure.js'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'

/**
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/config/profiles').API<HTTPClientExtraOptions>} ConfigProfilesAPI
 */

export const createList = configure(api => {
  /**
   * @type {ConfigProfilesAPI["list"]}
   */
  async function list (options = {}) {
    const res = await api.post('config/profile/list', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    const data = await res.json()

    return data.map((/** @type {Record<string, any>} */ profile) => objectToCamel(profile))
  }
  return list
})
