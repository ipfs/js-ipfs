'use strict'

const modeToString = require('../lib/mode-to-string')
const mtimeToObject = require('../lib/mtime-to-object')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (path, options = {}) => {
    const mtime = mtimeToObject(options.mtime)

    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', path)
    searchParams.set('mode', modeToString(options.mode))
    searchParams.set('hash', options.hashAlg)
    searchParams.set('hashAlg', null)
    if (mtime) {
      searchParams.set('mtime', mtime.secs)
      searchParams.set('mtimeNsecs', mtime.nsecs)
    }

    const res = await api.post('files/mkdir', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })
    return res.text()
  }
}
