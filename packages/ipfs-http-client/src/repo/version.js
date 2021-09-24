import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/repo').API<HTTPClientExtraOptions>} RepoAPI
 */

export const createVersion = configure(api => {
  /**
   * @type {RepoAPI["version"]}
   */
  async function version (options = {}) {
    const res = await (await api.post('repo/version', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json()

    return res.Version
  }
  return version
})
