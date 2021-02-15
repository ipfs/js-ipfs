'use strict'

const CID = require('cids')
const { DAGLink } = require('ipld-dag-pb')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object').API<HTTPClientExtraOptions>} ObjectAPI
 */

module.exports = configure(api => {
  /**
   * @type {ObjectAPI["links"]}
   */
  async function links (cid, options = {}) {
    const res = await api.post('object/links', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${cid instanceof Uint8Array ? new CID(cid) : cid}`,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return (data.Links || []).map((/** @type {any} */ l) => new DAGLink(l.Name, l.Size, l.Hash))
  }
  return links
})
