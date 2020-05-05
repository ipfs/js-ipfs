'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (cid, path, options = {}) => {
    if (typeof path === 'object') {
      options = path
      path = null
    }

    const res = await api.post('dag/resolve', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path ? [cid, path].join(path.startsWith('/') ? '' : '/') : `${cid}`,
        ...options
      }),
      headers: options.headers
    })

    const data = await res.json()

    return { cid: new CID(data.Cid['/']), remPath: data.RemPath }
  }
})
