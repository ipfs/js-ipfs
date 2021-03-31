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
   * @type {BitswapAPI["unwant"]}
   */
  async function unwant (cid, options = {}) {
    const res = await api.post('bitswap/unwant', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        // @ts-ignore - CID|string seems to confuse typedef
        arg: typeof cid === 'string' ? cid : new CID(cid).toString(),
        ...options
      }),
      headers: options.headers
    })

    return res.json()
  }
  return unwant
})
