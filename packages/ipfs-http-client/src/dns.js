import { configure } from './lib/configure.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

export const createDns = configure(api => {
  /**
   * @type {RootAPI["dns"]}
   */
  const dns = async (domain, options = {}) => {
    const res = await api.post('dns', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: domain,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return data.Path
  }

  return dns
})
