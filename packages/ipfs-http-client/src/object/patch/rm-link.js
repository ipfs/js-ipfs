import { CID } from 'multiformats/cid'
import { configure } from '../../lib/configure.js'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'

/**
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object/patch').API<HTTPClientExtraOptions>} ObjectPatchAPI
 */

export const createRmLink = configure(api => {
  /**
   * @type {ObjectPatchAPI["rmLink"]}
   */
  async function rmLink (cid, dLink, options = {}) {
    const res = await api.post('object/patch/rm-link', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          `${cid}`,
          // @ts-expect-error loose types
          dLink.Name || dLink.name || null
        ],
        ...options
      }),
      headers: options.headers
    })

    const { Hash } = await res.json()

    return CID.parse(Hash)
  }
  return rmLink
})
