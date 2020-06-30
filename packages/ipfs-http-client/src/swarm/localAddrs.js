'use strict'

const multiaddr = require('multiaddr')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await api.post('swarm/addrs/local', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    const { Strings } = await res.json()

    return (Strings || []).map(a => multiaddr(a))
  }
})
