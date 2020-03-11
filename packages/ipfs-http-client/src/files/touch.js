'use strict'

const mtimeToObject = require('../lib/mtime-to-object')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async function touch (path, options = {}) {
    const mtime = mtimeToObject(options.mtime)

    const searchParams = new URLSearchParams(options)
    searchParams.append('arg', path)
    if (mtime) {
      searchParams.set('mtime', mtime.secs)
      searchParams.set('mtimeNsecs', mtime.nsecs)
    }
    searchParams.set('hash', options.hashAlg)
    searchParams.set('hashAlg', null)

    const res = await api.post('files/touch', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })
    return res.text()
  }
}
