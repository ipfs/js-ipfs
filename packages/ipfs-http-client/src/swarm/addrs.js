'use strict'

const multiaddr = require('multiaddr')
/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
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
}
