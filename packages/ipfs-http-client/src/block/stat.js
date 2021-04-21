'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/block').API<HTTPClientExtraOptions>} BlockAPI
 */

module.exports = configure(api => {
  /**
   * @type {BlockAPI["stat"]}
   */
  async function stat (cid, options = {}) {
    const res = await api.post('block/stat', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: new CID(cid).toString(),
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return { cid: new CID(data.Key), size: data.Size }
  }

  return stat
})
