'use strict'

const CID = require('cids')
/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (paths, options = {}) => {
    paths = Array.isArray(paths) ? paths : [paths]

    const searchParams = new URLSearchParams(options)
    paths.forEach(path => searchParams.append('arg', `${path}`))

    const res = await (await api.post('pin/add', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })).json()

    return (res.Pins || []).map(cid => ({ cid: new CID(cid) }))
  }
}
