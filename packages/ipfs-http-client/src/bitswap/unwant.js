'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('..').Implements<import('ipfs-core/src/components/bitswap/unwant')>}
   */
  async function unwant (cid, options = {}) {
    if (Array.isArray(cid)) {
      throw Error('cid argument must be CID or a string')
    }

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
