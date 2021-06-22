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
   * @type {BitswapAPI["wantlistForPeer"]}
   */
  async function wantlistForPeer (peerId, options = {}) {
    // @ts-ignore - CID|string seems to confuse typedef
    peerId = typeof peerId === 'string' ? peerId : new CID(peerId).toString()

    const res = await (await api.post('bitswap/wantlist', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        peer: peerId
      }),
      headers: options.headers
    })).json()

    return (res.Keys || []).map((/** @type {{ '/': string }} */ k) => new CID(k['/']))
  }
  return wantlistForPeer
})
