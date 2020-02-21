'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (cid, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)

    if (typeof cid === 'string') {
      searchParams.set('arg', cid)
    } else {
      searchParams.set('arg', new CID(cid).toString())
    }

    const res = await ky.post('bitswap/unwant', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return res
  }
})
