import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object').API<HTTPClientExtraOptions>} ObjectAPI
 */

export const createGet = configure(api => {
  /**
   * @type {ObjectAPI["get"]}
   */
  async function get (cid, options = {}) {
    const res = await api.post('object/get', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${cid instanceof Uint8Array ? CID.decode(cid) : cid}`,
        dataEncoding: 'base64',
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return {
      Data: uint8ArrayFromString(data.Data, 'base64pad'),
      Links: (data.Links || []).map((/** @type {any} */ link) => ({
        Name: link.Name,
        Hash: CID.parse(link.Hash),
        Tsize: link.Size
      }))
    }
  }
  return get
})
