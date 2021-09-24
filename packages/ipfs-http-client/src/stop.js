import { configure } from './lib/configure.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

export const createStop = configure(api => {
  /**
   * @type {RootAPI["stop"]}
   */
  async function stop (options = {}) {
    const res = await api.post('shutdown', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    await res.text()
  }
  return stop
})
