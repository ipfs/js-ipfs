'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/diag').API<HTTPClientExtraOptions>} DiagAPI
 */

module.exports = configure(api => {
  /**
   * @type {DiagAPI["cmds"]}
   */
  async function cmds (options = {}) {
    const res = await api.post('diag/cmds', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return res.json()
  }
  return cmds
})
