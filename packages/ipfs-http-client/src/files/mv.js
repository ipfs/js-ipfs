import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>} FilesAPI
 */

export const createMv = configure(api => {
  /**
   * @type {FilesAPI["mv"]}
   */
  async function mv (sources, destination, options = {}) {
    if (!Array.isArray(sources)) {
      sources = [sources]
    }

    const res = await api.post('files/mv', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: sources.concat(destination),
        ...options
      }),
      headers: options.headers
    })
    await res.text()
  }

  return mv
})
