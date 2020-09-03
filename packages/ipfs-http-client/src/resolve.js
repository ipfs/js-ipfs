'use strict'

const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

module.exports = configure(api => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {import('../../ipfs/src/core/components/resolve').Resolve<import('.').HttpOptions>}
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
