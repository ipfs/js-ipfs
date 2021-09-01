'use strict'

const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

module.exports = configure(api => {
  /**
   * @type {RootAPI["cat"]}
   */
  async function * cat (path, options = {}) {
    const res = await api.post('cat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path.toString(),
        ...options
      }),
      headers: options.headers
    })

    yield * res.iterator()
  }

  return cat
})
