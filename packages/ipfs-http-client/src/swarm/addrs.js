'use strict'

const multiaddr = require('multiaddr')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await (await api.post('swarm/addrs', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options.searchParams
    })).json()

    return Object.keys(res.Addrs).map(id => ({
      id,
      addrs: (res.Addrs[id] || []).map(a => multiaddr(a))
    }))
  }
})
