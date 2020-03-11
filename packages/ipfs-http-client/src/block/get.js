'use strict'

const Block = require('ipfs-block')
const CID = require('cids')
const { Buffer } = require('buffer')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (cid, options = {}) => {
    cid = new CID(cid)
    options.arg = cid.toString()

    const rsp = await api.post('block/get', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    return new Block(Buffer.from(await rsp.arrayBuffer()), cid)
  }
})
