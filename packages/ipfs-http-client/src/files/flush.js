'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (path, options = {}) => {
    if (typeof path !== 'string') {
      options = path || {}
      path = '/'
    }

    const res = await api.post('files/flush', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      })
    })
    const data = await res.json()

    return new CID(data.Cid)
  }
})
