'use strict'

const toCamel = require('./lib/object-to-camel')
const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('.').Implements<import('../../ipfs-core/src/components/version')>}
   */
  async function version (options = {}) {
    const res = await api.post('version', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    const data = await res.json()

    return toCamel(data)
  }

  return version
})
