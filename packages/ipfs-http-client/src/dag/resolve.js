'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (cid, path, options = {}) => {
    if (typeof path === 'object') {
      options = path
      path = null
    }

    options.arg = path
      ? [cid, path].join(path.startsWith('/') ? '' : '/')
      : `${cid}`

    const res = await api.post('dag/resolve', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    const data = await res.json()

    return { cid: new CID(data.Cid['/']), remPath: data.RemPath }
  }
})
