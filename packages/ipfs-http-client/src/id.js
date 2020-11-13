'use strict'

const toCamel = require('./lib/object-to-camel')
const multiaddr = require('multiaddr')
const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('.').Implements<typeof import('ipfs-core/src/components/id')>}
   */
  async function id (options = {}) {
    const res = await api.post('id', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    const data = await res.json()

    const output = toCamel(data)

    if (output.addresses) {
      output.addresses = output.addresses.map(ma => multiaddr(ma))
    }

    return output
  }
  return id
})
