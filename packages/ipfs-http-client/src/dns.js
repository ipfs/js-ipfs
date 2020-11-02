'use strict'

const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('.').Implements<typeof import('ipfs-core/src/components/dns')>}
   */
  const dns = async (domain, options = {}) => {
    const res = await api.post('dns', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: domain,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return data.Path
  }

  return dns
})
