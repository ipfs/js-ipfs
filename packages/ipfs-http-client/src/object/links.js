import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object').API<HTTPClientExtraOptions>} ObjectAPI
 */

export const createLinks = configure(api => {
  /**
   * @type {ObjectAPI["links"]}
   */
  async function links (cid, options = {}) {
    const res = await api.post('object/links', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${cid instanceof Uint8Array ? CID.decode(cid) : cid}`,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return (data.Links || []).map((/** @type {any} */ l) => ({
      Name: l.Name,
      Tsize: l.Size,
      Hash: CID.parse(l.Hash)
    }))
  }
  return links
})
