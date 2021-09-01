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
   * @type {KeyAPI["list"]}
   */
  async function list (options = {}) {
    const res = await api.post('key/list', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    const data = await res.json()

    // @ts-ignore server output is not typed
    return (data.Keys || []).map((/** @type {any} **/ k) => toCamel(k))
  }
  return list
})
