import { objectToCamel } from './lib/object-to-camel.js'
import { configure } from './lib/configure.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

export const createVersion = configure(api => {
  /**
   * @type {RootAPI["version"]}
   */
  async function version (options = {}) {
    const res = await api.post('version', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    // @ts-expect-error server output is not typed
    return {
      ...objectToCamel(await res.json()),
      'ipfs-http-client': '1.0.0'
    }
  }

  return version
})
