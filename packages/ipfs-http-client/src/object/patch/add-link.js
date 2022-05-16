import { CID } from 'multiformats/cid'
import { configure } from '../../lib/configure.js'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'

/**
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object/patch').API<HTTPClientExtraOptions>} ObjectPatchAPI
 */

export const createAddLink = configure(api => {
  /**
   * @type {ObjectPatchAPI["addLink"]}
   */
  async function addLink (cid, dLink, options = {}) {
    const res = await api.post('object/patch/add-link', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: [
          `${cid}`,
          // @ts-expect-error loose types
          dLink.Name || dLink.name || '',
          // @ts-expect-error loose types
          (dLink.Hash || dLink.cid || '').toString() || null
        ],
        ...options
      }),
      headers: options.headers
    })

    const { Hash } = await res.json()

    return CID.parse(Hash)
  }

  return addLink
})
