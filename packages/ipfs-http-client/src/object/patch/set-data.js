import { CID } from 'multiformats/cid'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { configure } from '../../lib/configure.js'
import { toUrlSearchParams } from '../../lib/to-url-search-params.js'

/**
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object/patch').API<HTTPClientExtraOptions>} ObjectPatchAPI
 */

export const createSetData = configure(api => {
  /**
   * @type {ObjectPatchAPI["setData"]}
   */
  async function setData (cid, data, options = {}) {
    const res = await api.post('object/patch/set-data', {
      searchParams: toUrlSearchParams({
        arg: [
          `${cid}`
        ],
        ...options
      }),
      ...(
        await multipartRequest([data], options.headers)
      )
    })

    const { Hash } = await res.json()

    return CID.parse(Hash)
  }
  return setData
})
