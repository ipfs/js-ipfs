'use strict'

const CID = require('cids')
const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('.').Implements<typeof import('ipfs-core/src/components/cat')>}
   */
  async function * cat (path, options = {}) {
    const res = await api.post('cat', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: typeof path === 'string' ? path : new CID(path).toString(),
        ...options
      }),
      headers: options.headers
    })

    yield * res.iterator()
  }

  return cat
})
