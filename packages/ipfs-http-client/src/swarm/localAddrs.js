'use strict'

const { Multiaddr } = require('multiaddr')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/swarm').API<HTTPClientExtraOptions>} SwarmAPI
 */

module.exports = configure(api => {
  /**
   * @type {SwarmAPI["localAddrs"]}
   */
  async function localAddrs (options = {}) {
    const res = await api.post('swarm/addrs/local', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    /** @type {{ Strings: string[] }} */
    const { Strings } = await res.json()

    return (Strings || []).map(a => new Multiaddr(a))
  }
  return localAddrs
})
