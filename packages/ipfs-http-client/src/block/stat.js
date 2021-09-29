import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/block').API<HTTPClientExtraOptions>} BlockAPI
 */

export const createStat = configure(api => {
  /**
   * @type {BlockAPI["stat"]}
   */
  async function stat (cid, options = {}) {
    const res = await api.post('block/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cid.toString(),
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return { cid: CID.parse(data.Key), size: data.Size }
  }

  return stat
})
