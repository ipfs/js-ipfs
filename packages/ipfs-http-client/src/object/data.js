'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async function data (cid, options = {}) {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`)

    const res = await api.post('object/data', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })
    const data = await res.arrayBuffer()

    return Buffer.from(data)
  }
}
