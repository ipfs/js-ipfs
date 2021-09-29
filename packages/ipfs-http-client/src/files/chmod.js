import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>} FilesAPI
 */

export const createChmod = configure(api => {
  /**
   * @type {FilesAPI["chmod"]}
   */
  async function chmod (path, mode, options = {}) {
    const res = await api.post('files/chmod', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        mode,
        ...options
      }),
      headers: options.headers
    })

    await res.text()
  }
  return chmod
})
