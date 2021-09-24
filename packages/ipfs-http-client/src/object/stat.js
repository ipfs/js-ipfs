import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object').API<HTTPClientExtraOptions>} ObjectAPI
 */

export const createStat = configure(api => {
  /**
   * @type {ObjectAPI["stat"]}
   */
  async function stat (cid, options = {}) {
    const res = await api.post('object/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${cid}`,
        ...options
      }),
      headers: options.headers
    })

    const output = await res.json()

    return {
      ...output,
      Hash: CID.parse(output.Hash)
    }
  }
  return stat
})
