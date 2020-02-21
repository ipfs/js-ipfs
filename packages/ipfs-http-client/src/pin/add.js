'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (paths, options) => {
    paths = Array.isArray(paths) ? paths : [paths]
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    paths.forEach(path => searchParams.append('arg', `${path}`))
    if (options.recursive != null) searchParams.set('recursive', options.recursive)

    const res = await ky.post('pin/add', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return (res.Pins || []).map(cid => ({ cid: new CID(cid) }))
  }
})
