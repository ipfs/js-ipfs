'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('../../../ipfs-core/src/components/bootstrap/rm').BootstrapRm<import('..').HttpOptions>}
   */
  async function rm (addr, options = {}) {
    const res = await api.post('bootstrap/rm', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options.headers
    })

    return res.json()
  }

  return rm
})
