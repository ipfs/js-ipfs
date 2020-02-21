'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const configure = require('../../lib/configure')

module.exports = configure(({ ky }) => {
  return async (cid, dLink, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`)
    searchParams.append('arg', dLink.Name || dLink.name || null)

    const { Hash } = await ky.post('object/patch/rm-link', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return new CID(Hash)
  }
})
