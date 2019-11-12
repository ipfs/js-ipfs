'use strict'

const CID = require('cids')
const { Buffer } = require('buffer')
const configure = require('../lib/configure')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async (cid, options) => {
    options = options || {}

    if (Buffer.isBuffer(cid)) {
      cid = new CID(cid)
    }

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${cid}`)

    const res = await ky.get('block/stat', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return toCamel(res)
  }
})
