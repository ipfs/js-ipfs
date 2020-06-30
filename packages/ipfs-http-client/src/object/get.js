'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (cid, options = {}) => {
    const res = await api.post('object/get', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`,
        dataEncoding: 'base64',
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return new DAGNode(
      Buffer.from(data.Data, 'base64'),
      (data.Links || []).map(l => new DAGLink(l.Name, l.Size, l.Hash))
    )
  }
})
