'use strict'

const Multiaddr = require('multiaddr')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (addr, options = {}) => {
    if (addr && typeof addr === 'object' && !Multiaddr.isMultiaddr(addr)) {
      options = addr
      addr = null
    }

    options.arg = addr

    const res = await api.post('bootstrap/rm', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    return res.json()
  }
})
