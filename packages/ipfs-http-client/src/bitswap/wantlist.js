'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/bitswap').API<HTTPClientExtraOptions>} BitswapAPI
 */

module.exports = configure(api => {
  /**
   * @type {BitswapAPI["wantlist"]}
   */
  async function wantlist (options = {}) {
    const res = await (await api.post('bitswap/wantlist', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json()

    return (res.Keys || []).map((/** @type {{ '/': string }} */ k) => new CID(k['/']))
  }
  return wantlist
})
