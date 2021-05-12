'use strict'

const toCamel = require('../../lib/object-to-camel')
const configure = require('../../lib/configure')
const toUrlSearchParams = require('../../lib/to-url-search-params')

/**
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/name/pubsub').API<HTTPClientExtraOptions>} NamePubsubAPI
 */

module.exports = configure(api => {
  /**
   * @type {NamePubsubAPI["state"]}
   */
  async function state (options = {}) {
    const res = await api.post('name/pubsub/state', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    // @ts-ignore server output is not typed
    return toCamel(await res.json())
  }
  return state
})
