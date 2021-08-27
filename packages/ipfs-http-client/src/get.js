'use strict'

const { CID } = require('multiformats/cid')
const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

module.exports = configure(api => {
  /**
   * @type {RootAPI["get"]}
   */
  async function * get (path, options = {}) {
    /** @type {Record<string, any>} */
    const opts = {
      arg: `${path instanceof Uint8Array ? CID.decode(path) : path}`,
      ...options
    }

    if (opts.compressionLevel) {
      opts['compression-level'] = opts.compressionLevel
      delete opts.compressionLevel
    }

    const res = await api.post('get', {
      signal: options.signal,
      searchParams: toUrlSearchParams(opts),
      headers: options.headers
    })

    yield * res.iterator()
  }

  return get
})
