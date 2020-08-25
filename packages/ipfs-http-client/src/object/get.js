'use strict'

const CID = require('cids')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const uint8ArrayFromString = require('uint8arrays/from-string')

module.exports = configure(api => {
  return async (cid, options = {}) => {
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
      (data.Links || []).map(l => new DAGLink(l.Name, l.Size, l.Hash))
    )
  }
})
