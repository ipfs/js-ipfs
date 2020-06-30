'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (addrs, options = {}) => {
    addrs = Array.isArray(addrs) ? addrs : [addrs]

    const res = await api.post('swarm/disconnect', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addrs.map(addr => `${addr}`),
        ...options
      }),
      headers: options.headers
    })
    const { Strings } = await res.json()

    return Strings || []
  }
})
