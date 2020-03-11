'use strict'

const toCamel = require('./lib/object-to-camel')
const multiaddr = require('multiaddr')
const configure = require('./lib/configure')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await api.post('id', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options.searchParams
    })
    const data = await res.json()

    const output = toCamel(data)

    if (output.addresses) {
      output.addresses = output.addresses.map(ma => multiaddr(ma))
    }

    return output
  }
})
