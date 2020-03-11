'use strict'

const CID = require('cids')

module.exports = api => {
  return async (cid, options = {}) => {
    options.arg = typeof cid === 'string' ? cid : new CID(cid).toString()

    const res = await api.post('bitswap/unwant', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    return res.json()
  }
}
