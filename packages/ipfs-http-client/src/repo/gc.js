import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/repo').API<HTTPClientExtraOptions>} RepoAPI
 */

export const createGc = configure(api => {
  /**
   * @type {RepoAPI["gc"]}
   */
  async function * gc (options = {}) {
    const res = await api.post('repo/gc', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers,
      transform: (res) => {
        return {
          err: res.Error ? new Error(res.Error) : null,
          cid: (res.Key || {})['/'] ? CID.parse(res.Key['/']) : null
        }
      }
    })

    yield * res.ndjson()
  }
  return gc
})
