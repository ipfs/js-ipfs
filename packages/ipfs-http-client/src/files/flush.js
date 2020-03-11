'use strict'

const CID = require('cids')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (path, options = {}) => {
    if (typeof path !== 'string') {
      options = path || {}
      path = '/'
    }

    options.arg = path

    const res = await api.post('files/flush', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })
    const data = await res.json()

    return new CID(data.Cid)
  }
}
