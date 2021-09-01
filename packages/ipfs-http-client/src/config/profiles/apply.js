'use strict'

const configure = require('../../lib/configure')
const toUrlSearchParams = require('../../lib/to-url-search-params')

/**
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/config/profiles').API<HTTPClientExtraOptions>} ConfigProfilesAPI
 */

module.exports = configure(api => {
  /**
   * @type {ConfigProfilesAPI["apply"]}
   */
  async function apply (profile, options = {}) {
    const res = await api.post('config/profile/apply', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: profile,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return {
      original: data.OldCfg, updated: data.NewCfg
    }
  }

  return apply
})
