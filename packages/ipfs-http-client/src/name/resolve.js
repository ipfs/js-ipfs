'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/name').API<HTTPClientExtraOptions>} NameAPI
 */

module.exports = configure(api => {
  /**
   * @type {NameAPI["resolve"]}
   */
  async function * resolve (path, options = {}) {
    const res = await api.post('name/resolve', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        stream: true,
        ...options
      }),
      headers: options.headers
    })

    for await (const result of res.ndjson()) {
      yield result.Path
    }
  }
  return resolve
})
