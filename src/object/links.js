'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const { DAGLink } = require('ipld-dag-pb')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (cid, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`)

    const res = await ky.post('object/links', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return (res.Links || []).map(l => new DAGLink(l.Name, l.Size, l.Hash))
  }
})
