'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object').API<HTTPClientExtraOptions>} ObjectAPI
 */

module.exports = configure(api => {
  /**
   * @type {ObjectAPI["data"]}
   */
  async function data (cid, options = {}) {
    const res = await api.post('object/data', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${cid instanceof Uint8Array ? new CID(cid) : cid}`,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.arrayBuffer()

    return new Uint8Array(data, 0, data.byteLength)
  }
  return data
})
