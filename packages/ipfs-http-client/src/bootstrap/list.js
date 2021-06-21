'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const { Multiaddr } = require('multiaddr')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/bootstrap').API<HTTPClientExtraOptions>} BootstrapAPI
 */

module.exports = configure(api => {
  /**
   * @type {BootstrapAPI["list"]}
   */
  async function list (options = {}) {
    const res = await api.post('bootstrap/list', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    const { Peers } = await res.json()

    return { Peers: Peers.map((/** @type {string} */ ma) => new Multiaddr(ma)) }
  }

  return list
})
