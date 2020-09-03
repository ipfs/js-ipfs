'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {import('../../../ipfs/src/core/components/bitswap/unwant').Unwant<import('..').HttpOptions>}
   */
  async function unwant (cid, options = {}) {
    const res = await api.post('bitswap/unwant', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: typeof cid === 'string' ? cid : new CID(cid).toString(),
        ...options
      }),
      headers: options.headers
    })

    return res.json()
  }
  return unwant
})
