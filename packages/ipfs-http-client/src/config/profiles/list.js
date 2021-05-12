'use strict'

const toCamel = require('../../lib/object-to-camel')
const configure = require('../../lib/configure')
const toUrlSearchParams = require('../../lib/to-url-search-params')

/**
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/config/profiles').API<HTTPClientExtraOptions>} ConfigProfilesAPI
 */

module.exports = configure(api => {
  /**
   * @type {ConfigProfilesAPI["list"]}
   */
  async function list (options = {}) {
    const res = await api.post('config/profile/list', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    const data = await res.json()

    return data.map((/** @type {Record<string, any>} */ profile) => toCamel(profile))
  }
  return list
})
