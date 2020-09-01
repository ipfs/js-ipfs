'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {import('../../../ipfs/src/core/components/bitswap/wantlist').WantlistFn<import('..').HttpOptions>}
   */
  async function wantlist (options = {}) {
    const res = await (await api.post('bitswap/wantlist', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })).json()

    return (res.Keys || []).map(k => new CID(k['/']))
  }
  return wantlist
})
