'use strict'

const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

module.exports = configure(api => {
  /**
   * @type {RootAPI["resolve"]}
   */
  async function resolve (path, options = {}) {
    const res = await api.post('resolve', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })
    const { Path } = await res.json()
    return Path
  }
  return resolve
})
