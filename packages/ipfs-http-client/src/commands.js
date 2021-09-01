'use strict'

const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

module.exports = configure(api => {
  /**
   * @type {RootAPI["commands"]}
   */
  const commands = async (options = {}) => {
    const res = await api.post('commands', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return res.json()
  }
  return commands
})
