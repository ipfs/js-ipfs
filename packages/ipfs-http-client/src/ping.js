'use strict'

const toCamel = require('./lib/object-to-camel')
const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

module.exports = configure(api => {
  /**
   * @type {RootAPI["ping"]}
   */
  async function * ping (peerId, options = {}) {
    const res = await api.post('ping', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${peerId}`,
        ...options
      }),
      headers: options.headers,
      transform: toCamel
    })

    yield * res.ndjson()
  }
  return ping
})
