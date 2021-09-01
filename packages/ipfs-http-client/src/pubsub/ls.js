'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pubsub').API<HTTPClientExtraOptions>} PubsubAPI
 */

module.exports = configure(api => {
  /**
   * @type {PubsubAPI["ls"]}
   */
  async function ls (options = {}) {
    const { Strings } = await (await api.post('pubsub/ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json()

    return Strings || []
  }
  return ls
})
