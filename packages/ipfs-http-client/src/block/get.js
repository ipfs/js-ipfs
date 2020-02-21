'use strict'

const Block = require('ipfs-block')
const CID = require('cids')
const { Buffer } = require('buffer')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (cid, options) => {
    cid = new CID(cid)
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${cid}`)

    const data = await ky.post('block/get', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).arrayBuffer()

    return new Block(Buffer.from(data), cid)
  }
})
