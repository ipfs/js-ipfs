'use strict'

const CID = require('cids')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (cid, options = {}) => {
    options.arg = (new CID(cid)).toString()

    const response = await api.post('block/stat', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })
    const res = await response.json()

    return { cid: new CID(res.Key), size: res.Size }
  }
}
