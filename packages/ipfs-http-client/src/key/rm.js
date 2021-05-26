'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/key').API<HTTPClientExtraOptions>} KeyAPI
 */

module.exports = configure(api => {
  /**
   * @type {KeyAPI["rm"]}
   */
  async function rm (name, options = {}) {
    const res = await api.post('key/rm', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    // @ts-ignore server output is not typed
    return toCamel(data.Keys[0])
  }
  return rm
})
