'use strict'

const configure = require('./lib/configure')
const toCamel = require('./lib/object-to-camel')
const multiaddr = require('multiaddr')

module.exports = configure(({ ky }) => {
  return async options => {
    options = options || {}

    const res = await ky.post('id', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams
    }).json()

    const output = toCamel(res)

    if (output.addresses) {
      output.addresses = output.addresses.map(ma => multiaddr(ma))
    }

    return output
  }
})
