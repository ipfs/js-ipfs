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
    if (options.all != null) searchParams.set('all', options.all)

    const res = await ky.post('bootstrap/rm', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return res
  }
})
