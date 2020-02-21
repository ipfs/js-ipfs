'use strict'

const Multiaddr = require('multiaddr')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (addr, options) => {
    if (addr && typeof addr === 'object' && !Multiaddr.isMultiaddr(addr)) {
      options = addr
      addr = null
    }

    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (addr) searchParams.set('arg', `${addr}`)
    if (options.default != null) searchParams.set('default', options.default)

    const res = await ky.post('bootstrap/add', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return res
  }
})
