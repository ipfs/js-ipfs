'use strict'

const configure = require('../lib/configure')
const mtimeToObject = require('../lib/mtime-to-object')

module.exports = configure(({ ky }) => {
  return function touch (path, options) {
    options = options || {}
    const mtime = mtimeToObject(options.mtime)

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.append('arg', path)
    if (mtime) {
      searchParams.set('mtime', mtime.secs)
      searchParams.set('mtimeNsecs', mtime.nsecs)
    }
    if (options.flush != null) searchParams.set('flush', options.flush)
    if (options.hashAlg) searchParams.set('hash', options.hashAlg)
    if (options.parents != null) searchParams.set('parents', options.parents)

    return ky.post('files/touch', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).text()
  }
})
