'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (path, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${path}`)
    if (options.recursive != null) searchParams.set('recursive', options.recursive)

    const res = await ky.post('pin/rm', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return (res.Pins || []).map(cid => ({ cid: new CID(cid) }))
  }
})
