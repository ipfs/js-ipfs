

// @ts-expect-error no types
const toIterable = require('stream-to-it/source')
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>} FilesAPI
 */

 export const createRead = configure(api => {
  /**
   * @type {FilesAPI["read"]}
   */
  async function * read (path, options = {}) {
    const res = await api.post('files/read', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        count: options.length,
        ...options
      }),
      headers: options.headers
    })

    yield * toIterable(res.body)
  }
  return read
})
