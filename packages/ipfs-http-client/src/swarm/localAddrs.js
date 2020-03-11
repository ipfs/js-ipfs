'use strict'

const multiaddr = require('multiaddr')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await (await api.post('swarm/addrs/local', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })).json()

    return (res.Strings || []).map(a => multiaddr(a))
  }
})
