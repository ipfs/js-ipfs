'use strict'

const multiaddr = require('multiaddr')
/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (options = {}) => {
    const res = await (await api.post('swarm/addrs/local', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })).json()

    return (res.Strings || []).map(a => multiaddr(a))
  }
}
