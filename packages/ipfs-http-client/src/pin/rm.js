'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (path, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', `${path}`)

    const res = await (await api.post('pin/rm', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })).json()

    return (res.Pins || []).map(cid => ({ cid: new CID(cid) }))
  }
})
