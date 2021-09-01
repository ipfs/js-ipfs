'use strict'

const { CID } = require('multiformats/cid')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object').API<HTTPClientExtraOptions>} ObjectAPI
 */

module.exports = configure(api => {
  /**
   * @type {ObjectAPI["get"]}
   */
  async function get (cid, options = {}) {
    const res = await api.post('object/get', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${cid instanceof Uint8Array ? CID.decode(cid) : cid}`,
        dataEncoding: 'base64',
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return {
      Data: uint8ArrayFromString(data.Data, 'base64pad'),
      Links: (data.Links || []).map((/** @type {any} */ link) => ({
        Name: link.Name,
        Hash: CID.parse(link.Hash),
        Tsize: link.Size
      }))
    }
  }
  return get
})
