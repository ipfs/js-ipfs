'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/name').API<HTTPClientExtraOptions>} NameAPI
 */

module.exports = configure(api => {
  /**
   * @type {NameAPI["publish"]}
   */
  async function publish (path, options = {}) {
    const res = await api.post('name/publish', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })

    // @ts-ignore server output is not typed
    return toCamel(await res.json())
  }
  return publish
})
