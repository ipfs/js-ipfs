import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dag').API<HTTPClientExtraOptions>} DAGAPI
 */

export const createExport = configure(api => {
  /**
   * @type {DAGAPI["export"]}
   */
  async function * dagExport (root, options = {}) {
    const res = await api.post('dag/export', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: root.toString()
      }),
      headers: options.headers
    })

    yield * res.iterator()
  }

  return dagExport
})
