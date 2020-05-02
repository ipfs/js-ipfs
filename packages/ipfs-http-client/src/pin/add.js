'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (paths, options = {}) => {
    paths = Array.isArray(paths) ? paths : [paths]

    const res = await (await api.post('pin/add', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: paths.map(path => `${path}`),
        ...options
      }),
      headers: options.headers
    })).json()

    return (res.Pins || []).map(cid => ({ cid: new CID(cid) }))
  }
})
