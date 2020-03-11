'use strict'

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (addrs, options = {}) => {
    addrs = Array.isArray(addrs) ? addrs : [addrs]

    const searchParams = new URLSearchParams(options)
    addrs.forEach(addr => searchParams.append('arg', addr))

    const res = await (await api.post('swarm/connect', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })).json()

    return res.Strings || []
  }
}
