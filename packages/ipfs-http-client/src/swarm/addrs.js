'use strict'

const multiaddr = require('multiaddr')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async options => {
    options = options || {}

    const res = await ky.post('swarm/addrs', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams
    }).json()

    return Object.keys(res.Addrs).map(id => ({
      id,
      addrs: (res.Addrs[id] || []).map(a => multiaddr(a))
    }))
  }
})
