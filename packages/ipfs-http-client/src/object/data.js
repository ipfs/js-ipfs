'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async function data (cid, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`)

    const data = await ky.post('object/data', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).arrayBuffer()

    return Buffer.from(data)
  }
})
