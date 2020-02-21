'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (addrs, options) => {
    addrs = Array.isArray(addrs) ? addrs : [addrs]
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    addrs.forEach(addr => searchParams.append('arg', `${addr}`))

    const res = await ky.post('swarm/disconnect', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return res.Strings || []
  }
})
