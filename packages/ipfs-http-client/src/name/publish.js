
import { objectToCamel } from '../lib/object-to-camel'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/name').API<HTTPClientExtraOptions>} NameAPI
 */

 export const createPublish = configure(api => {
  /**
   * @type {NameAPI["publish"]}
   */
  async function publish (path, options = {}) {
    const res = await api.post('name/publish', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${path}`,
        ...options
      }),
      headers: options.headers
    })

    // @ts-ignore server output is not typed
    return toCamel(await res.json())
  }
  return publish
})
