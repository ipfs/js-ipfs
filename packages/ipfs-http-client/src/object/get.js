'use strict'

const CID = require('cids')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const uint8ArrayFromString = require('uint8arrays/from-string')

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
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${cid instanceof Uint8Array ? new CID(cid) : cid}`,
        dataEncoding: 'base64',
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return new DAGNode(
      uint8ArrayFromString(data.Data, 'base64pad'),
      (data.Links || []).map((/** @type {any} */ l) => new DAGLink(l.Name, l.Size, l.Hash))
    )
  }
  return get
})
