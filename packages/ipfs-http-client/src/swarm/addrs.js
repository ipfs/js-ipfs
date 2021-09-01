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
   * @type {SwarmAPI["addrs"]}
   */
  async function addrs (options = {}) {
    const res = await api.post('swarm/addrs', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    /** @type {{ Addrs: Record<string, string[]> }} */
    const { Addrs } = await res.json()

    return Object.keys(Addrs).map(id => ({
      id,
      addrs: (Addrs[id] || []).map(a => new Multiaddr(a))
    }))
  }
  return addrs
})
