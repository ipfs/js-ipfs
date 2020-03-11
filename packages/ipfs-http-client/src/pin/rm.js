'use strict'

const CID = require('cids')
/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
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
}
