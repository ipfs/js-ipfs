'use strict'

const multiaddr = require('multiaddr')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async options => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.id != null) searchParams.append('id', options.id)

    const res = await ky.post('swarm/addrs/local', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return (res.Strings || []).map(a => multiaddr(a))
  }
})
