'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (cid, options = {}) => {
    options.arg = typeof cid === 'string' ? cid : new CID(cid).toString()

    const res = await api.post('bitswap/unwant', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    return res.json()
  }
})
