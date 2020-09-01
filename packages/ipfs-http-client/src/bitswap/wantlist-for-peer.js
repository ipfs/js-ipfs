'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {import('../../../ipfs/src/core/components/bitswap/wantlist-for-peer').WantlistForPeer<import('..').HttpOptions>}
   */
  async function wantlistForPeer (peerId, options = {}) {
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

    return (res.Keys || []).map(k => new CID(k['/']))
  }
  return wantlistForPeer
})
