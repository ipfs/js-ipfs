'use strict'

const toCamel = require('./lib/object-to-camel')
const { Multiaddr } = require('multiaddr')
const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

module.exports = configure(api => {
  /**
   * @type {RootAPI["id"]}
   */
  async function id (options = {}) {
    const res = await api.post('id', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: options.peerId ? options.peerId.toString() : undefined,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    const output = {
      ...toCamel(data)
    }

    if (output.addresses) {
      output.addresses = output.addresses.map((/** @type {string} */ ma) => new Multiaddr(ma))
    }

    // @ts-ignore server output is not typed
    return output
  }
  return id
})
