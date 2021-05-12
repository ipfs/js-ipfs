'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/swarm').API<HTTPClientExtraOptions>} SwarmAPI
 */

module.exports = configure(api => {
  /**
   * @type {SwarmAPI["disconnect"]}
   */
  async function disconnect (addr, options = {}) {
    const res = await api.post('swarm/disconnect', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options.headers
    })
    const { Strings } = await res.json()

    return Strings || []
  }
  return disconnect
})
