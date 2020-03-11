'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (cid, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`)
    searchParams.set('data-encoding', 'base64')

    const res = await api.post('object/get', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })
    const data = await res.json()

    return new DAGNode(
      Buffer.from(data.Data, 'base64'),
      (data.Links || []).map(l => new DAGLink(l.Name, l.Size, l.Hash))
    )
  }
})
