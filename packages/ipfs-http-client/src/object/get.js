'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (cid, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`)
    searchParams.set('data-encoding', 'base64')

    const res = await ky.post('object/get', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return new DAGNode(
      Buffer.from(res.Data, 'base64'),
      (res.Links || []).map(l => new DAGLink(l.Name, l.Size, l.Hash))
    )
  }
})
