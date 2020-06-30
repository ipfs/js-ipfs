'use strict'

const multiaddr = require('multiaddr')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await api.post('swarm/addrs', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    const { Addrs } = await res.json()

    return Object.keys(Addrs).map(id => ({
      id,
      addrs: (Addrs[id] || []).map(a => multiaddr(a))
    }))
  }
})
