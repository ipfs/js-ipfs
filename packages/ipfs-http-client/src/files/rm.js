import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import HTTP from 'ipfs-utils/src/http.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>} FilesAPI
 */

export const createRm = configure(api => {
  /**
   * @type {FilesAPI["rm"]}
   */
  async function rm (path, options = {}) {
    const res = await api.post('files/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })

    const body = await res.text()
    // we don't expect text body to be ever present
    // (if so, it means an error such as https://github.com/ipfs/go-ipfs/issues/8606)
    if (body !== '') {
      /** @type {Error} */
      const error = new HTTP.HTTPError(res)
      error.message = body
      throw error
    }
  }
  return rm
})
